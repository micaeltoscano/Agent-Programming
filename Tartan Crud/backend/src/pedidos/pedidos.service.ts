import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { AuthUser } from '../auth/current-user.decorator';
import {
  OrderStatus,
  PaymentStatus,
  StockMovementType,
  UserRole,
} from '../common/enums';
import { Cupom } from '../entities/cupom.entity';
import { Endereco } from '../entities/endereco.entity';
import { Insumo } from '../entities/insumo.entity';
import { ItemPedido } from '../entities/item-pedido.entity';
import { MovimentacaoEstoque } from '../entities/movimentacao-estoque.entity';
import { Pagamento } from '../entities/pagamento.entity';
import { Pedido } from '../entities/pedido.entity';
import { Produto } from '../entities/produto.entity';
import { CupomService } from './cupom.service';
import { CreatePedidoDto, ItemPedidoDto } from './dto';
import { EventsGateway } from '../events/events.gateway';

/**
 * Transições legais da máquina de estados. Impede fluxos ilógicos como
 * marcar ENTREGUE antes de PRONTO (cenário exploratório da Fase 5).
 */
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDENTE]: [OrderStatus.CONFIRMADO, OrderStatus.CANCELADO],
  [OrderStatus.CONFIRMADO]: [OrderStatus.EM_PRODUCAO, OrderStatus.CANCELADO],
  [OrderStatus.EM_PRODUCAO]: [OrderStatus.PRONTO, OrderStatus.CANCELADO],
  [OrderStatus.PRONTO]: [OrderStatus.A_CAMINHO],
  [OrderStatus.A_CAMINHO]: [OrderStatus.ENTREGUE],
  [OrderStatus.ENTREGUE]: [],
  [OrderStatus.CANCELADO]: [],
};

/** Quais perfis podem executar cada transição. */
const TRANSITION_ROLES: Partial<Record<OrderStatus, UserRole[]>> = {
  [OrderStatus.EM_PRODUCAO]: [UserRole.COZINHA, UserRole.ADMIN, UserRole.FUNCIONARIO],
  [OrderStatus.PRONTO]: [UserRole.COZINHA, UserRole.ADMIN, UserRole.FUNCIONARIO],
  [OrderStatus.A_CAMINHO]: [UserRole.MOTOBOY, UserRole.ADMIN],
  [OrderStatus.ENTREGUE]: [UserRole.MOTOBOY, UserRole.ADMIN],
  [OrderStatus.CANCELADO]: [UserRole.ADMIN, UserRole.FUNCIONARIO],
};

@Injectable()
export class PedidosService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly cupomService: CupomService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Cria e confirma o pedido dentro de UMA transação:
   *  1. Congela preços e calcula subtotal.
   *  2. Aplica cupom com clamp (SEC-01): total nunca < 0.
   *  3. Baixa automática do estoque com LOCK PESSIMISTA por insumo (RACE-01):
   *     SELECT ... FOR UPDATE serializa compras concorrentes do último item.
   */
  /** Códigos SQLSTATE do Postgres para conflitos de concorrência. */
  private static readonly CONFLICT_CODES = new Set([
    '40001', // serialization_failure
    '40P01', // deadlock_detected
    '55P03', // lock_not_available
  ]);

  private mapConflito(err: any): never {
    if (err?.code && PedidosService.CONFLICT_CODES.has(err.code)) {
      throw new ConflictException(
        'Conflito de concorrência no estoque; tente novamente',
      );
    }
    throw err;
  }

  async criar(dto: CreatePedidoDto, user: AuthUser): Promise<Pedido> {
    try {
      const pedido = await this.criarTransacional(dto, user);
      this.eventsGateway.emitPedidoCriado(pedido);
      return pedido;
    } catch (err) {
      this.mapConflito(err);
    }
  }

  private criarTransacional(dto: CreatePedidoDto, user: AuthUser): Promise<Pedido> {
    return this.dataSource.transaction('SERIALIZABLE', async (mgr) => {
      const cliente = await mgr.findOneByOrFail(
        (await import('../entities/usuario.entity')).Usuario,
        { id: user.id },
      );

      // 1. Resolve produtos e monta itens com preço congelado.
      const { itens, subtotal } = await this.montarItens(mgr, dto.itens);

      // 2. Cupom (clamp anti-negativo)
      let cupom: Cupom | null = null;
      let desconto = 0;
      if (dto.cupomCodigo) {
        const r = await this.cupomService.validarECalcular(dto.cupomCodigo, subtotal);
        cupom = r.cupom;
        desconto = r.desconto;
      }
      const total = Math.max(0, subtotal - desconto); // SEC-01: nunca negativo

      // 3. Baixa de estoque com lock pessimista + histórico.
      await this.baixarEstoque(mgr, itens);

      let endereco: Endereco | null = null;
      if (dto.enderecoEntregaId) {
        endereco = await mgr.findOne(Endereco, {
          where: { id: dto.enderecoEntregaId },
          relations: { usuario: true },
        });
        if (!endereco) throw new NotFoundException('Endereço não encontrado');
      }

      const pedido = mgr.create(Pedido, {
        cliente,
        itens,
        status: OrderStatus.CONFIRMADO,
        subtotal: subtotal.toFixed(2),
        desconto: desconto.toFixed(2),
        total: total.toFixed(2),
        cupom,
        enderecoEntrega: endereco,
      });
      const salvo = await mgr.save(Pedido, pedido);

      // Fase 7: Motor de desconto progressivo.
      // Se subtotal >= 25.00, gera um cupom promocional para a próxima compra.
      let cupomGerado: Cupom | undefined;
      if (subtotal >= 25.00) {
        const codigoPromocional = `VOLTE-${salvo.id.split('-')[0].toUpperCase()}`;
        const novoCupom = mgr.create(Cupom, {
          codigo: codigoPromocional,
          valorDesconto: '10.00', // Cupom de 10 reais para incentivar o retorno
          valorMinimoPedido: '30.00',
        });
        cupomGerado = await mgr.save(Cupom, novoCupom);
      }

      const pagamento = mgr.create(Pagamento, {
        pedido: salvo,
        metodo: dto.metodoPagamento,
        status: PaymentStatus.PAGO,
        valor: total.toFixed(2),
      });
      await mgr.save(Pagamento, pagamento);

      // Recarrega dentro da MESMA transação
      const pedidoFinal = await mgr.findOneOrFail(Pedido, { where: { id: salvo.id } });
      if (cupomGerado) {
        (pedidoFinal as any).cupomGerado = cupomGerado;
      }
      return pedidoFinal;
    });
  }

  private async montarItens(
    mgr: EntityManager,
    itensDto: ItemPedidoDto[],
  ): Promise<{ itens: ItemPedido[]; subtotal: number }> {
    let subtotal = 0;
    const itens: ItemPedido[] = [];
    for (const item of itensDto) {
      const produto = await mgr.findOne(Produto, {
        where: { id: item.produtoId },
        relations: { insumos: { insumo: true } },
      });
      if (!produto) throw new NotFoundException(`Produto ${item.produtoId} não encontrado`);
      if (!produto.disponivel) {
        throw new BadRequestException(`Produto ${produto.nome} indisponível`);
      }
      const precoUnitario = Number(produto.preco);
      subtotal += precoUnitario * item.quantidade;
      itens.push(
        mgr.create(ItemPedido, {
          produto,
          quantidade: item.quantidade,
          precoUnitario: precoUnitario.toFixed(2),
        }),
      );
    }
    return { itens, subtotal };
  }

  /**
   * Baixa automática de estoque (REQ-01) resistente a race conditions (RACE-01).
   * Para cada insumo consumido:
   *   - SELECT ... FOR UPDATE (pessimistic_write) bloqueia a linha até o commit;
   *   - valida disponibilidade; se insuficiente, aborta a transação inteira;
   *   - subtrai e registra a movimentação de SAÍDA.
   */
  private async baixarEstoque(mgr: EntityManager, itens: ItemPedido[]) {
    // Agrega consumo total por insumo (produto pode repetir a receita).
    const consumo = new Map<string, number>();
    for (const item of itens) {
      for (const pi of item.produto.insumos ?? []) {
        const atual = consumo.get(pi.insumo.id) ?? 0;
        consumo.set(pi.insumo.id, atual + Number(pi.quantidade) * item.quantidade);
      }
    }

    // Ordena por id para prevenir deadlock em locks concorrentes.
    const ids = [...consumo.keys()].sort();
    for (const insumoId of ids) {
      const necessario = consumo.get(insumoId)!;
      const insumo = await mgr
        .createQueryBuilder(Insumo, 'i')
        .setLock('pessimistic_write') // SELECT ... FOR UPDATE
        .where('i.id = :id', { id: insumoId })
        .getOne();
      if (!insumo) throw new NotFoundException('Insumo do produto não encontrado');

      const restante = Number(insumo.quantidade) - necessario;
      if (restante < 0) {
        throw new BadRequestException(
          `Estoque insuficiente do insumo "${insumo.nome}" (necessário ${necessario}, disponível ${insumo.quantidade})`,
        );
      }
      insumo.quantidade = restante.toString();
      await mgr.save(Insumo, insumo);
      await mgr.save(
        MovimentacaoEstoque,
        mgr.create(MovimentacaoEstoque, {
          insumo,
          tipo: StockMovementType.SAIDA,
          quantidade: necessario.toString(),
          observacao: 'Baixa automática por pedido',
        }),
      );
    }
  }

  async findAll(user: AuthUser, take: number = 50, skip: number = 0): Promise<Pedido[]> {
    const repo = this.dataSource.getRepository(Pedido);
    // Cliente só vê os próprios pedidos.
    if (user.role === UserRole.CLIENTE) {
      return repo.find({ where: { cliente: { id: user.id } }, order: { criadoEm: 'DESC' }, take, skip });
    }
    // Cozinha vê pedidos em fila de produção.
    if (user.role === UserRole.COZINHA) {
      return repo.find({
        where: [
          { status: OrderStatus.CONFIRMADO },
          { status: OrderStatus.EM_PRODUCAO },
          { status: OrderStatus.PRONTO },
        ],
        order: { criadoEm: 'ASC' },
        take,
        skip,
      });
    }
    // Motoboy vê pedidos prontos / em rota.
    if (user.role === UserRole.MOTOBOY) {
      return repo.find({
        where: [{ status: OrderStatus.PRONTO }, { status: OrderStatus.A_CAMINHO }],
        order: { criadoEm: 'ASC' },
        take,
        skip,
      });
    }
    // Admin/Funcionário veem tudo.
    return repo.find({ order: { criadoEm: 'DESC' }, take, skip });
  }

  async findOne(id: string, user: AuthUser): Promise<Pedido> {
    const pedido = await this.dataSource.getRepository(Pedido).findOne({ where: { id } });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');
    if (user.role === UserRole.CLIENTE && pedido.cliente.id !== user.id) {
      throw new ForbiddenException('Acesso negado a este pedido');
    }
    return pedido;
  }

  /** Transição de status validada pela máquina de estados + RBAC. */
  async atualizarStatus(id: string, novo: OrderStatus, user: AuthUser): Promise<Pedido> {
    return this.dataSource.transaction(async (mgr) => {
      const pedido = await mgr.findOne(Pedido, { where: { id } });
      if (!pedido) throw new NotFoundException('Pedido não encontrado');

      const permitidas = ORDER_TRANSITIONS[pedido.status];
      if (!permitidas.includes(novo)) {
        throw new BadRequestException(
          `Transição inválida: ${pedido.status} -> ${novo}`,
        );
      }
      const rolesPermitidos = TRANSITION_ROLES[novo];
      if (rolesPermitidos && !rolesPermitidos.includes(user.role)) {
        throw new ForbiddenException(
          `Perfil ${user.role} não pode mover pedido para ${novo}`,
        );
      }

      // Cancelamento estorna o estoque baixado.
      if (novo === OrderStatus.CANCELADO && pedido.status !== OrderStatus.PENDENTE) {
        await this.estornarEstoque(mgr, pedido);
        if (pedido.pagamento) {
          pedido.pagamento.status = PaymentStatus.ESTORNADO;
          await mgr.save(Pagamento, pedido.pagamento);
        }
      }

      if (novo === OrderStatus.A_CAMINHO && user.role === UserRole.MOTOBOY) {
        const motoboy = await mgr.findOneByOrFail(
          (await import('../entities/usuario.entity')).Usuario,
          { id: user.id },
        );
        pedido.motoboy = motoboy;
      }

      pedido.status = novo;
      await mgr.save(Pedido, pedido);
      const salvo = await mgr.findOneOrFail(Pedido, { where: { id } });
      this.eventsGateway.emitStatusAtualizado(salvo);
      return salvo;
    });
  }

  private async estornarEstoque(mgr: EntityManager, pedido: Pedido) {
    const consumo = new Map<string, number>();
    for (const item of pedido.itens ?? []) {
      const produto = await mgr.findOne(Produto, {
        where: { id: item.produto.id },
        relations: { insumos: { insumo: true } },
      });
      for (const pi of produto?.insumos ?? []) {
        const atual = consumo.get(pi.insumo.id) ?? 0;
        consumo.set(pi.insumo.id, atual + Number(pi.quantidade) * item.quantidade);
      }
    }
    for (const insumoId of [...consumo.keys()].sort()) {
      const qtd = consumo.get(insumoId)!;
      const insumo = await mgr
        .createQueryBuilder(Insumo, 'i')
        .setLock('pessimistic_write')
        .where('i.id = :id', { id: insumoId })
        .getOne();
      if (!insumo) continue;
      insumo.quantidade = (Number(insumo.quantidade) + qtd).toString();
      await mgr.save(Insumo, insumo);
      await mgr.save(
        MovimentacaoEstoque,
        mgr.create(MovimentacaoEstoque, {
          insumo,
          tipo: StockMovementType.ESTORNO,
          quantidade: qtd.toString(),
          referenciaPedidoId: pedido.id,
          observacao: 'Estorno por cancelamento de pedido',
        }),
      );
    }
  }
}

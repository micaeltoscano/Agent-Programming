import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { OrderStatus } from '../common/enums';
import { ItemPedido } from '../entities/item-pedido.entity';
import { Pedido } from '../entities/pedido.entity';
import { PeriodoDto } from './dto';

/** Faturamento só conta pedidos que não foram cancelados. */
const FATURAVEIS = [
  OrderStatus.CONFIRMADO,
  OrderStatus.EM_PRODUCAO,
  OrderStatus.PRONTO,
  OrderStatus.A_CAMINHO,
  OrderStatus.ENTREGUE,
];

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidos: Repository<Pedido>,
    @InjectRepository(ItemPedido)
    private readonly itens: Repository<ItemPedido>,
  ) {}

  /**
   * Normaliza o período. Rejeita datas invertidas (fim < inicio) — tratamento
   * de erro exigido pelo Validador (Limites Analíticos / Fase 6).
   */
  private resolverPeriodo(p: PeriodoDto): { inicio: Date; fim: Date } {
    // `fim` padrão é o instante atual (inclui pedidos de hoje). Quando o
    // usuário passa só a data (YYYY-MM-DD), expandimos para o fim do dia
    // para incluir o dia inteiro no relatório.
    const fim = p.fim ? new Date(p.fim) : new Date();
    if (p.fim && this.isDateOnly(p.fim)) {
      fim.setUTCHours(23, 59, 59, 999);
    }
    // padrão: últimos 30 dias
    const inicio = p.inicio
      ? new Date(p.inicio)
      : new Date(fim.getTime() - 30 * 24 * 60 * 60 * 1000);

    if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
      throw new BadRequestException('Datas inválidas');
    }
    if (fim < inicio) {
      throw new BadRequestException(
        'Período inválido: a data final não pode ser anterior à inicial',
      );
    }
    return { inicio, fim };
  }

  private isDateOnly(s: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(s);
  }

  /** Resumo com os principais indicadores (seção 4.4 da Atividade 03). */
  async resumo(periodo: PeriodoDto) {
    const { inicio, fim } = this.resolverPeriodo(periodo);
    const pedidos = await this.pedidos.find({
      where: { criadoEm: Between(inicio, fim) },
    });

    const faturaveis = pedidos.filter((p) => FATURAVEIS.includes(p.status));
    const cancelados = pedidos.filter((p) => p.status === OrderStatus.CANCELADO);

    const faturamento = faturaveis.reduce((s, p) => s + Number(p.total), 0);
    const ticketMedio = faturaveis.length ? faturamento / faturaveis.length : 0;

    return {
      periodo: { inicio, fim },
      totalPedidos: pedidos.length,
      pedidosFaturaveis: faturaveis.length,
      pedidosCancelados: cancelados.length,
      taxaCancelamento: pedidos.length
        ? +(cancelados.length / pedidos.length).toFixed(4)
        : 0,
      faturamento: +faturamento.toFixed(2),
      ticketMedio: +ticketMedio.toFixed(2),
    };
  }

  /** Produtos mais vendidos por quantidade (seção 4.4-d). */
  async maisVendidos(periodo: PeriodoDto, limite = 10) {
    const { inicio, fim } = this.resolverPeriodo(periodo);
    const rows = await this.itens
      .createQueryBuilder('item')
      .innerJoin('item.pedido', 'pedido')
      .innerJoin('item.produto', 'produto')
      .where('pedido.criadoEm BETWEEN :inicio AND :fim', { inicio, fim })
      .andWhere('pedido.status != :cancelado', {
        cancelado: OrderStatus.CANCELADO,
      })
      .select('produto.id', 'produtoId')
      .addSelect('produto.nome', 'nome')
      .addSelect('SUM(item.quantidade)', 'quantidade')
      .addSelect('SUM(item.quantidade * item.precoUnitario)', 'receita')
      .groupBy('produto.id')
      .addGroupBy('produto.nome')
      .orderBy('quantidade', 'DESC')
      .limit(limite)
      .getRawMany();

    return rows.map((r) => ({
      produtoId: r.produtoId,
      nome: r.nome,
      quantidade: Number(r.quantidade),
      receita: +Number(r.receita).toFixed(2),
    }));
  }

  /** Vendas agregadas por bairro (base para o mapa de João Pessoa, seção 4.5). */
  async vendasPorBairro(periodo: PeriodoDto) {
    const { inicio, fim } = this.resolverPeriodo(periodo);
    const rows = await this.pedidos
      .createQueryBuilder('pedido')
      .leftJoin('pedido.enderecoEntrega', 'endereco')
      .where('pedido.criadoEm BETWEEN :inicio AND :fim', { inicio, fim })
      .andWhere('pedido.status != :cancelado', {
        cancelado: OrderStatus.CANCELADO,
      })
      .select('COALESCE(endereco.bairro, :semBairro)', 'bairro')
      .setParameter('semBairro', 'Sem endereço')
      .addSelect('COUNT(pedido.id)', 'pedidos')
      .addSelect('SUM(pedido.total)', 'faturamento')
      .groupBy('bairro')
      .orderBy('faturamento', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      bairro: r.bairro,
      pedidos: Number(r.pedidos),
      faturamento: +Number(r.faturamento).toFixed(2),
    }));
  }

  /** Série diária de faturamento para o gráfico do dashboard. */
  async faturamentoDiario(periodo: PeriodoDto) {
    const { inicio, fim } = this.resolverPeriodo(periodo);
    const rows = await this.pedidos
      .createQueryBuilder('pedido')
      .where('pedido.criadoEm BETWEEN :inicio AND :fim', { inicio, fim })
      .andWhere('pedido.status != :cancelado', {
        cancelado: OrderStatus.CANCELADO,
      })
      .select("TO_CHAR(pedido.criadoEm, 'YYYY-MM-DD')", 'dia')
      .addSelect('COUNT(pedido.id)', 'pedidos')
      .addSelect('SUM(pedido.total)', 'faturamento')
      .groupBy('dia')
      .orderBy('dia', 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      dia: r.dia,
      pedidos: Number(r.pedidos),
      faturamento: +Number(r.faturamento).toFixed(2),
    }));
  }
}

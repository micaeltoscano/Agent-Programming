import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockMovementType } from '../common/enums';
import { Insumo } from '../entities/insumo.entity';
import { MovimentacaoEstoque } from '../entities/movimentacao-estoque.entity';
import { ProdutoInsumo } from '../entities/produto-insumo.entity';
import { CreateInsumoDto, MovimentacaoDto, UpdateInsumoDto } from './dto';

@Injectable()
export class EstoqueService {
  constructor(
    @InjectRepository(Insumo)
    private readonly insumos: Repository<Insumo>,
    @InjectRepository(MovimentacaoEstoque)
    private readonly movimentacoes: Repository<MovimentacaoEstoque>,
    @InjectRepository(ProdutoInsumo)
    private readonly produtoInsumos: Repository<ProdutoInsumo>,
  ) {}

  findAll() {
    return this.insumos.find({ order: { nome: 'ASC' } });
  }

  async findOne(id: string) {
    const i = await this.insumos.findOne({ where: { id } });
    if (!i) throw new NotFoundException('Insumo não encontrado');
    return i;
  }

  async create(dto: CreateInsumoDto) {
    const insumo = this.insumos.create({
      nome: dto.nome,
      unidade: dto.unidade ?? 'un',
      quantidade: (dto.quantidade ?? 0).toString(),
      estoqueMinimo: (dto.estoqueMinimo ?? 0).toString(),
    });
    return this.insumos.save(insumo);
  }

  async update(id: string, dto: UpdateInsumoDto) {
    const insumo = await this.findOne(id);
    if (dto.nome !== undefined) insumo.nome = dto.nome;
    if (dto.unidade !== undefined) insumo.unidade = dto.unidade;
    if (dto.estoqueMinimo !== undefined)
      insumo.estoqueMinimo = dto.estoqueMinimo.toString();
    return this.insumos.save(insumo);
  }

  async remove(id: string) {
    const insumo = await this.findOne(id);
    const vinculados = await this.produtoInsumos.count({
      where: { insumo: { id } },
    });
    if (vinculados > 0) {
      throw new ConflictException(
        `Não é possível remover: insumo usado em ${vinculados} produto(s)`,
      );
    }
    await this.insumos.remove(insumo);
    return { removido: true };
  }

  /** Entrada manual: soma ao estoque e registra movimentação. */
  async entrada(id: string, dto: MovimentacaoDto) {
    const insumo = await this.findOne(id);
    const nova = Number(insumo.quantidade) + dto.quantidade;
    insumo.quantidade = nova.toString();
    await this.insumos.save(insumo);
    await this.registrar(insumo, StockMovementType.ENTRADA, dto.quantidade, dto.observacao);
    return insumo;
  }

  /** Saída manual: subtrai do estoque, nunca deixando negativo. */
  async saida(id: string, dto: MovimentacaoDto) {
    const insumo = await this.findOne(id);
    const nova = Number(insumo.quantidade) - dto.quantidade;
    if (nova < 0) {
      throw new ConflictException('Estoque insuficiente para esta saída');
    }
    insumo.quantidade = nova.toString();
    await this.insumos.save(insumo);
    await this.registrar(insumo, StockMovementType.SAIDA, dto.quantidade, dto.observacao);
    return insumo;
  }

  historico(id: string) {
    return this.movimentacoes.find({
      where: { insumo: { id } },
      order: { criadoEm: 'DESC' },
    });
  }

  private registrar(
    insumo: Insumo,
    tipo: StockMovementType,
    quantidade: number,
    observacao?: string,
    referenciaPedidoId?: string,
  ) {
    return this.movimentacoes.save(
      this.movimentacoes.create({
        insumo,
        tipo,
        quantidade: quantidade.toString(),
        observacao,
        referenciaPedidoId,
      }),
    );
  }
}

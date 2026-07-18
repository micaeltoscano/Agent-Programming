import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Categoria } from '../entities/categoria.entity';
import { Insumo } from '../entities/insumo.entity';
import { ProdutoInsumo } from '../entities/produto-insumo.entity';
import { Produto } from '../entities/produto.entity';
import { CreateProdutoDto, ProdutoInsumoDto, UpdateProdutoDto } from './dto';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtos: Repository<Produto>,
    @InjectRepository(Categoria)
    private readonly categorias: Repository<Categoria>,
    @InjectRepository(Insumo)
    private readonly insumos: Repository<Insumo>,
    @InjectRepository(ProdutoInsumo)
    private readonly produtoInsumos: Repository<ProdutoInsumo>,
  ) {}

  findAll() {
    return this.produtos.find({ relations: { insumos: true }, order: { nome: 'ASC' } });
  }

  async findOne(id: string) {
    const p = await this.produtos.findOne({
      where: { id },
      relations: { insumos: true },
    });
    if (!p) throw new NotFoundException('Produto não encontrado');
    return p;
  }

  private async resolverCategoria(id: string) {
    const c = await this.categorias.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Categoria não encontrada');
    return c;
  }

  private async montarInsumos(itens: ProdutoInsumoDto[]): Promise<ProdutoInsumo[]> {
    if (!itens || itens.length === 0) return [];
    const ids = itens.map((i) => i.insumoId);
    const encontrados = await this.insumos.find({ where: { id: In(ids) } });
    if (encontrados.length !== new Set(ids).size) {
      throw new NotFoundException('Um ou mais insumos não existem');
    }
    const byId = new Map(encontrados.map((i) => [i.id, i]));
    return itens.map((i) =>
      this.produtoInsumos.create({
        insumo: byId.get(i.insumoId)!,
        quantidade: i.quantidade.toString(),
      }),
    );
  }

  async create(dto: CreateProdutoDto) {
    const categoria = await this.resolverCategoria(dto.categoriaId);
    const produto = this.produtos.create({
      nome: dto.nome,
      descricao: dto.descricao,
      preco: dto.preco.toString(),
      disponivel: dto.disponivel ?? true,
      categoria,
      insumos: await this.montarInsumos(dto.insumos ?? []),
    });
    return this.produtos.save(produto);
  }

  async update(id: string, dto: UpdateProdutoDto) {
    const produto = await this.findOne(id);
    if (dto.categoriaId) produto.categoria = await this.resolverCategoria(dto.categoriaId);
    if (dto.nome !== undefined) produto.nome = dto.nome;
    if (dto.descricao !== undefined) produto.descricao = dto.descricao;
    if (dto.preco !== undefined) produto.preco = dto.preco.toString();
    if (dto.disponivel !== undefined) produto.disponivel = dto.disponivel;

    if (dto.insumos) {
      // substitui a "receita" completa
      await this.produtoInsumos.delete({ produto: { id } });
      produto.insumos = await this.montarInsumos(dto.insumos);
    }
    return this.produtos.save(produto);
  }

  async remove(id: string) {
    const produto = await this.findOne(id);
    await this.produtos.remove(produto);
    return { removido: true };
  }
}

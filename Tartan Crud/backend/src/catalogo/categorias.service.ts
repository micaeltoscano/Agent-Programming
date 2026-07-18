import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../entities/categoria.entity';
import { Produto } from '../entities/produto.entity';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categorias: Repository<Categoria>,
    @InjectRepository(Produto)
    private readonly produtos: Repository<Produto>,
  ) {}

  findAll() {
    return this.categorias.find({ order: { nome: 'ASC' } });
  }

  async findOne(id: string) {
    const c = await this.categorias.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Categoria não encontrada');
    return c;
  }

  async create(dto: CreateCategoriaDto) {
    const existe = await this.categorias.findOne({ where: { nome: dto.nome } });
    if (existe) throw new ConflictException('Categoria já existe');
    return this.categorias.save(this.categorias.create(dto));
  }

  async update(id: string, dto: UpdateCategoriaDto) {
    const c = await this.findOne(id);
    Object.assign(c, dto);
    return this.categorias.save(c);
  }

  /**
   * Integridade referencial: não permite apagar categoria com produtos
   * vinculados (cenário exploratório do Validador na Fase 3).
   */
  async remove(id: string) {
    const c = await this.findOne(id);
    const vinculados = await this.produtos.count({
      where: { categoria: { id } },
    });
    if (vinculados > 0) {
      throw new ConflictException(
        `Não é possível remover: ${vinculados} produto(s) vinculado(s) a esta categoria`,
      );
    }
    await this.categorias.remove(c);
    return { removido: true };
  }
}

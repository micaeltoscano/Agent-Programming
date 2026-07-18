import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from '../entities/categoria.entity';
import { Insumo } from '../entities/insumo.entity';
import { MovimentacaoEstoque } from '../entities/movimentacao-estoque.entity';
import { ProdutoInsumo } from '../entities/produto-insumo.entity';
import { Produto } from '../entities/produto.entity';
import {
  CategoriasController,
  EstoqueController,
  ProdutosController,
} from './catalogo.controller';
import { CategoriasService } from './categorias.service';
import { EstoqueService } from './estoque.service';
import { ProdutosService } from './produtos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Categoria,
      Produto,
      Insumo,
      ProdutoInsumo,
      MovimentacaoEstoque,
    ]),
  ],
  controllers: [CategoriasController, ProdutosController, EstoqueController],
  providers: [CategoriasService, ProdutosService, EstoqueService],
  exports: [EstoqueService],
})
export class CatalogoModule {}

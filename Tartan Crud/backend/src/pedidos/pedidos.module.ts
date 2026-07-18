import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cupom } from '../entities/cupom.entity';
import { Endereco } from '../entities/endereco.entity';
import { Insumo } from '../entities/insumo.entity';
import { ItemPedido } from '../entities/item-pedido.entity';
import { MovimentacaoEstoque } from '../entities/movimentacao-estoque.entity';
import { Pagamento } from '../entities/pagamento.entity';
import { Pedido } from '../entities/pedido.entity';
import { Produto } from '../entities/produto.entity';
import { Usuario } from '../entities/usuario.entity';
import { CupomService } from './cupom.service';
import { CuponsController, PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      ItemPedido,
      Endereco,
      Pagamento,
      Produto,
      Insumo,
      MovimentacaoEstoque,
      Cupom,
      Usuario,
    ]),
  ],
  controllers: [PedidosController, CuponsController],
  providers: [PedidosService, CupomService],
})
export class PedidosModule {}

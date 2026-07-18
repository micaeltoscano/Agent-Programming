import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemPedido } from '../entities/item-pedido.entity';
import { Pedido } from '../entities/pedido.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, ItemPedido])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

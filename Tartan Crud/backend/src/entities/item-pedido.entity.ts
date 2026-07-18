import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { Produto } from './produto.entity';

@Entity('itens_pedido')
export class ItemPedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pedido, (p) => p.itens, { onDelete: 'CASCADE' })
  pedido: Pedido;

  @ManyToOne(() => Produto, { eager: true, onDelete: 'RESTRICT' })
  produto: Produto;

  @Column({ type: 'int' })
  quantidade: number;

  /** Preço unitário congelado no momento do pedido. */
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  precoUnitario: string;
}

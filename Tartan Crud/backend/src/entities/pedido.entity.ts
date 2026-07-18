import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderStatus } from '../common/enums';
import { Cupom } from './cupom.entity';
import { Endereco } from './endereco.entity';
import { ItemPedido } from './item-pedido.entity';
import { Pagamento } from './pagamento.entity';
import { Usuario } from './usuario.entity';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Usuario, (u) => u.pedidos, { eager: true, onDelete: 'RESTRICT' })
  cliente: Usuario;

  @OneToMany(() => ItemPedido, (i) => i.pedido, { cascade: true, eager: true })
  itens: ItemPedido[];

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDENTE })
  status: OrderStatus;

  /** Soma dos itens (preço * qtd) antes de descontos. */
  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  subtotal: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  desconto: string;

  /** subtotal - desconto. Invariante: nunca < 0 (cf. SEC-01). */
  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  total: string;

  @ManyToOne(() => Cupom, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  cupom?: Cupom | null;

  @ManyToOne(() => Endereco, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  enderecoEntrega?: Endereco | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  motoboy?: Usuario | null;

  @OneToOne(() => Pagamento, (p) => p.pedido, { cascade: true, eager: true })
  pagamento?: Pagamento;

  @CreateDateColumn({ type: 'timestamptz' })
  criadoEm: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  atualizadoEm: Date;
}

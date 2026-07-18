import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('cupons')
export class Cupom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  codigo: string;

  /** Valor de desconto em R$ (desconto fixo). */
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  valorDesconto: string;

  /** Valor mínimo do pedido para o cupom ser válido. */
  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  valorMinimoPedido: string;

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  validoAte?: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentMethod, PaymentStatus } from '../common/enums';
import { Pedido } from './pedido.entity';

@Entity('pagamentos')
export class Pagamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Pedido, (p) => p.pagamento, { onDelete: 'CASCADE' })
  @JoinColumn()
  pedido: Pedido;

  @Column({ type: 'enum', enum: PaymentMethod })
  metodo: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDENTE })
  status: PaymentStatus;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  valor: string;

  @CreateDateColumn({ type: 'timestamptz' })
  criadoEm: Date;
}

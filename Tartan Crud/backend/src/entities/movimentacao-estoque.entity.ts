import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StockMovementType } from '../common/enums';
import { Insumo } from './insumo.entity';

/** Histórico de movimentações de estoque (entrada/saída/ajuste/estorno). */
@Entity('movimentacoes_estoque')
export class MovimentacaoEstoque {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Insumo, { eager: true, onDelete: 'CASCADE' })
  insumo: Insumo;

  @Column({ type: 'enum', enum: StockMovementType })
  tipo: StockMovementType;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantidade: string;

  @Column({ nullable: true })
  referenciaPedidoId?: string;

  @Column({ nullable: true })
  observacao?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  criadoEm: Date;
}

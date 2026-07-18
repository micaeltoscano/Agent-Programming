import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  VersionColumn,
} from 'typeorm';
import { ProdutoInsumo } from './produto-insumo.entity';

/**
 * Insumo = item de estoque (matéria-prima). A quantidade disponível vive aqui.
 * VersionColumn habilita detecção de concorrência; a baixa de estoque no
 * checkout usa lock pessimista (SELECT ... FOR UPDATE) — cf. RACE-01.
 */
@Entity('insumos')
export class Insumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nome: string;

  @Column({ default: 'un' })
  unidade: string;

  @Column({ type: 'numeric', precision: 12, scale: 3, default: 0 })
  quantidade: string; // numeric -> string no driver pg; convertido nos serviços

  @Column({ type: 'numeric', precision: 12, scale: 3, default: 0 })
  estoqueMinimo: string;

  @VersionColumn()
  versao: number;

  @OneToMany(() => ProdutoInsumo, (pi) => pi.insumo)
  produtos: ProdutoInsumo[];
}

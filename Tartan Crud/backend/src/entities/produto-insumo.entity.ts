import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Insumo } from './insumo.entity';
import { Produto } from './produto.entity';

/**
 * Entidade associativa `Utiliza` (Produto "utiliza" Insumo).
 * Modelada como entidade própria — e NÃO como relacionamento simples —
 * para rastrear com precisão a dependência de dados (qtd consumida por
 * unidade do produto). Requisito explícito do plano do implementador e
 * validado em [BD-01].
 */
@Entity('produto_insumos')
@Unique(['produto', 'insumo'])
export class ProdutoInsumo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Produto, (p) => p.insumos, { onDelete: 'CASCADE' })
  produto: Produto;

  @ManyToOne(() => Insumo, (i) => i.produtos, { eager: true, onDelete: 'RESTRICT' })
  insumo: Insumo;

  /** Quantidade de insumo consumida por 1 unidade do produto. */
  @Column({ type: 'numeric', precision: 12, scale: 3 })
  quantidade: string;
}

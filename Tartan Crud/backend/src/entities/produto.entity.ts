import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Categoria } from './categoria.entity';
import { ProdutoInsumo } from './produto-insumo.entity';

@Entity('produtos')
export class Produto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  preco: string;

  @Column({ default: true })
  disponivel: boolean;

  @ManyToOne(() => Categoria, (c) => c.produtos, { eager: true })
  categoria: Categoria;

  /**
   * Entidade associativa `Utiliza`: relaciona Produto <-> Insumo com a
   * quantidade consumida por unidade vendida. É a base da baixa automática.
   */
  @OneToMany(() => ProdutoInsumo, (pi) => pi.produto, { cascade: true })
  insumos: ProdutoInsumo[];
}

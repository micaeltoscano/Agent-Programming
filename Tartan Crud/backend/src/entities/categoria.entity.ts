import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Produto } from './produto.entity';

@Entity('categorias')
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nome: string;

  @Column({ nullable: true })
  descricao?: string;

  @OneToMany(() => Produto, (p) => p.categoria)
  produtos: Produto[];
}

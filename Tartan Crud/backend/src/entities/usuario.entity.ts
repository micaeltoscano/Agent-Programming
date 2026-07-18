import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../common/enums';
import { Endereco } from './endereco.entity';
import { Pedido } from './pedido.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  senhaHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENTE })
  role: UserRole;

  @Column({ nullable: true })
  telefone?: string;

  @Column({ default: true })
  ativo: boolean;

  @OneToMany(() => Endereco, (e) => e.usuario)
  enderecos: Endereco[];

  @OneToMany(() => Pedido, (p) => p.cliente)
  pedidos: Pedido[];

  @CreateDateColumn({ type: 'timestamptz' })
  criadoEm: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  atualizadoEm: Date;
}

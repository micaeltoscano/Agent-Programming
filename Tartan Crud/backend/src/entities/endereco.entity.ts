import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from './usuario.entity';

@Entity('enderecos')
export class Endereco {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  logradouro: string;

  @Column()
  numero: string;

  @Column({ nullable: true })
  complemento?: string;

  @Column()
  bairro: string;

  @Column({ default: 'João Pessoa' })
  cidade: string;

  @Column({ nullable: true })
  cep?: string;

  @ManyToOne(() => Usuario, (u) => u.enderecos, { onDelete: 'CASCADE' })
  usuario: Usuario;
}

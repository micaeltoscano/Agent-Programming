import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums';
import { Usuario } from '../entities/usuario.entity';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarios: Repository<Usuario>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto, isAdminCaller = false): Promise<Usuario> {
    const existente = await this.usuarios.findOne({ where: { email: dto.email } });
    if (existente) throw new ConflictException('E-mail já cadastrado');

    // Registro público sempre cria CLIENTE; apenas admin define outros perfis.
    const role = isAdminCaller && dto.role ? dto.role : UserRole.CLIENTE;

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const usuario = this.usuarios.create({
      nome: dto.nome,
      email: dto.email,
      telefone: dto.telefone,
      role,
      senhaHash,
    });
    const salvo = await this.usuarios.save(usuario);
    delete (salvo as Partial<Usuario>).senhaHash;
    return salvo;
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; usuario: Partial<Usuario> }> {
    const usuario = await this.usuarios
      .createQueryBuilder('u')
      .addSelect('u.senhaHash')
      .where('u.email = :email', { email: dto.email })
      .getOne();

    if (!usuario || !usuario.ativo) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const ok = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');

    const accessToken = await this.jwt.signAsync({
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
      nome: usuario.nome,
    });
    const userCompleto = await this.getMe(usuario.id);

    return {
      accessToken,
      usuario: userCompleto,
    };
  }

  async getMe(userId: string): Promise<Usuario> {
    const usuario = await this.usuarios.findOne({
      where: { id: userId },
      relations: ['enderecos'],
    });
    if (!usuario) throw new UnauthorizedException('Usuário não encontrado');
    delete (usuario as Partial<Usuario>).senhaHash;
    return usuario;
  }
}

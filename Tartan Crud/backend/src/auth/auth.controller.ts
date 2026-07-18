import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { UserRole } from '../common/enums';
import { AuthService } from './auth.service';
import { CurrentUser, AuthUser } from './current-user.decorator';
import { LoginDto, RegisterDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Registro público: sempre cria CLIENTE. */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto, false);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  /** Admin cria usuários com qualquer perfil (funcionário, cozinha, motoboy...). */
  @Post('usuarios')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  criarUsuario(@Body() dto: RegisterDto, @CurrentUser() _user: AuthUser) {
    return this.auth.register(dto, true);
  }

  /** Retorna o usuário logado atualmente com base no token JWT. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return user;
  }
}

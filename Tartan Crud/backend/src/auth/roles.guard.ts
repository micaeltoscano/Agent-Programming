import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../common/enums';
import { ROLES_KEY } from './roles.decorator';

/**
 * Garante o isolamento de perfis (RBAC) — critério de aceitação (i) e [AUTH-01].
 * Nega acesso quando o role do token não está na lista permitida na rota.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException('Perfil sem permissão para esta rota');
    }
    return true;
  }
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../common/enums';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  nome: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest().user,
);

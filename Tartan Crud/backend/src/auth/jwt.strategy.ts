import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../common/enums';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  nome: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'change-me-in-production'),
    });
  }

  // Retorno vira req.user
  async validate(payload: JwtPayload) {
    return { id: payload.sub, email: payload.email, role: payload.role, nome: payload.nome };
  }
}

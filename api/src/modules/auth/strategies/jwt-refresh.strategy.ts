import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_REFRESH_SECRET'),
    });
  }

  validate(payload: any) {
    // Проверяем, что это действительно refresh токен
    if (!payload.refreshToken) {
      return null;
    }

    return {
      userId: payload.sub,
      phone: payload.phone,
      role: payload.role,
      refreshToken: payload.refreshToken,
    };
  }
}

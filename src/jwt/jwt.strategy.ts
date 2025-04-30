// src/auth/strategies/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del header
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwtSecret') || 'defaultSecret', // Ensure a default value is provided
    });
  }

  validate(payload: {
    sub: string;
    email: string;
    name: string;
    mfa: boolean;
  }) {
    // Lo que devuelvas aquí estará disponible en req.user
    return {
      _id: payload.sub,
      email: payload.email,
      name: payload.name,
      mfa: payload.mfa,
    };
  }
}
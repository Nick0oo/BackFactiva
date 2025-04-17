// src/auth/strategies/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extrae el token del header
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'defaultSecret', // Usa la clave secreta del .env o un valor por defecto
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

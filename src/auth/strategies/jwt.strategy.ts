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

  async validate(payload: any) {
    // Lo que devuelvas aquí estará disponible en req.user
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}

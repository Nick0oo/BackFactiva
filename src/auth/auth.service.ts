// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  private refreshSecret: string;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {
    this.refreshSecret = process.env.REFRESH_SECRET || 'default_refresh_secret';
  }

    // Método para registrar un nuevo usuario
    async register(createUserDto: CreateUserDto) {
      // Verificar si el email ya está registrado
      const userExists = await this.usersService.findByEmail(createUserDto.email);
      if (userExists) {
        throw new Error('El email ya está registrado');
      }
  
      // Hashear la contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
  
      // Crear el nuevo usuario
      const newUser = await this.usersService.create({
        ...createUserDto,
        password: hashedPassword,
      });
  
      // Generar el token JWT para el nuevo usuario
      const token = this.generateJwt(newUser);
  
      // Devolver el nuevo usuario junto con el token
      return { user: newUser, token };
    }

  async validateOAuthLogin(profile: any): Promise<{ user: any; accessToken: string }> {
    const user = await this.usersService.findOrCreateOAuthUser(profile);

    const payload = { sub: user._id, email: user.email, name: user.name };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
    });

    return { user, accessToken };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
  
    const { password: _, ...result } = user;
    return result;
  }

generateJwt(user: any) {
  return jwt.sign(
    { sub: user._id, email: user.email },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '15m' }, // Token de acceso corto
  );
}

generateRefreshToken(user: any) {
  return jwt.sign(
    { sub: user._id },
    this.refreshSecret,
    { expiresIn: '7d' },
  );
}

verifyRefreshToken(token: string): any | null {
  try {
    return jwt.verify(token, this.refreshSecret);
  } catch (err) {
    return null;
  }
}

async refreshAccessToken(refreshToken: string) {
  const payload = this.verifyRefreshToken(refreshToken);
  if (!payload) return null;

  const user = await this.usersService.findById(payload.sub);
  if (!user || !user.hashedRefreshToken) return null;

  const match = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
  if (!match) return null;

  const newAccessToken = this.generateJwt(user);
  const newRefreshToken = this.generateRefreshToken(user);

  const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
  await this.usersService.updateRefreshToken(user._id as string, hashedNewRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

async revokeRefreshToken(userId: string) {
  await this.usersService.updateRefreshToken(userId, null);
}
}

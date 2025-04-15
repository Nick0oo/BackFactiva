// src/auth/auth.controller.ts
import { Controller, Post, Get, Req, Res, UseGuards, Body, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Inicia la redirección a Google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    if (!req.user || !req.user.jwt) {
      return res.status(401).json({ message: 'Autenticación fallida' });
    }
  
    const { jwtToken, user } = req.user;
    return res.redirect(`http://localhost:4200/auth/callback?token=${jwtToken}`);
  }
  
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(body.email);
    console.log('Usuario encontrado:', user);
    if (!user || !user.password) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordMatch = await bcrypt.compare(body.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const token = this.authService.generateJwt(user);
    return { user, token };
  }
}

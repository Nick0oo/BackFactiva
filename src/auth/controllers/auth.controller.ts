// src/auth/auth.controller.ts
import { Controller, Post, Get, Req, Res, UseGuards, Body, UnauthorizedException, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) { }
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
  async login(@Body() body: LoginDto) {
    // Validación manual (por ejemplo, si el email no es proporcionado)
    if (!body.email || !body.password) {
      throw new UnauthorizedException('El email y la contraseña son obligatorios');
    }

    // Buscar al usuario en la base de datos por email
    const user = await this.usersService.findByEmail(body.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificar la contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(body.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Generar el JWT y el refresh token
    const accessToken = this.authService.generateJwt(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    // Guardar el refresh token en la base de datos (hasheado)
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user._id as string, hashedRefreshToken);

    return { user, accessToken, refreshToken };
  }
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      // Registra al nuevo usuario y genera un token
      const { user, token } = await this.authService.register(createUserDto);

      // Configura la cookie con HttpOnly
      res.cookie('auth_token', token, {
        httpOnly: true,  // Impide que sea accesible a través de JavaScript
        secure: process.env.NODE_ENV === 'production',  // Asegúrate de usar secure en producción
        maxAge: 3600000,  // Expira en 1 hora
      });

      // Devuelve solo el usuario en el cuerpo de la respuesta
      return res.status(201).json({ message: 'Usuario creado exitosamente', user });
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Error al crear el usuario');
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Query('token') token: string, 
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }


}
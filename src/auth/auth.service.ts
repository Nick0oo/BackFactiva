import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config'; 

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserDocument } from '../users/entities/user.entity'; // Adjust the path if necessary

@Injectable()
export class AuthService {

  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Normalizar email
    const normalizedEmail = createUserDto.email.trim().toLowerCase();
    createUserDto.email = normalizedEmail;

    // Verificar si el usuario ya existe
    const userExists = await this.usersService.findByEmail(normalizedEmail);
    if (userExists) {
      throw new ConflictException('El email ya está registrado');
    }

    // Verificar que la contraseña no esté ya hasheada (si se proporciona)
    if (
      createUserDto.password && 
      (createUserDto.password.startsWith('$2b$') || createUserDto.password.length > 60)
    ) {
      throw new BadRequestException('Formato de contraseña inválido.');
    }

    let newUser: UserDocument;
    try {
      newUser = (await this.usersService.create(createUserDto)) as UserDocument;
    } catch (error) {
      console.error('Error al crear usuario en UsersService:', error);
      throw new InternalServerErrorException('Error interno al crear el usuario.');
    }

    if (!newUser || !newUser._id) {
      throw new InternalServerErrorException('No se pudo completar la creación del usuario.');
    }

    const accessToken = this.generateJwt({
      _id: newUser._id.toString(),
      email: newUser.email,
    });
    const refreshToken = this.generateRefreshToken({
      _id: newUser._id.toString(),
    });

    try {
      const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
      await this.usersService.updateRefreshToken(newUser._id.toString(), hashedRefreshToken);
    } catch (error) {
      console.error(`Error al guardar refresh token para ${newUser._id}:`, error);
    }

    return {
      user: { _id: newUser._id, email: newUser.email, name: newUser.name },
      tokens: { accessToken, refreshToken }
    };
  } 

  async validateUser(email: string, password: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user) {
      return null;
    }

    if (!user.password || user.password.length < 10) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      password.trim(),
      user.password,
    );
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  generateJwt(user: { _id: string; email: string }, mfa: boolean = false): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    const expiresIn = this.configService.get<string>('JWT_EXPIRATION') || '15m';
    if (!secret) {
      throw new InternalServerErrorException('Error de configuración del servidor.');
    }
    const payload = {
      sub: user._id,
      email: user.email,
      mfa,
    };
    // Usa JwtService para firmar
    return this.jwtService.sign(payload, { secret, expiresIn });
  }

  generateRefreshToken(user: { _id: string }): string {

    const secret = this.configService.get<string>('REFRESH_SECRET');
    // Asegúrate que REFRESH_EXPIRATION esté en tu .env, si no usa '7d'
    const expiresIn = this.configService.get<string>('REFRESH_EXPIRATION') || '7d';
    if (!secret) {
      throw new InternalServerErrorException('Error de configuración del servidor.');
    }
    // Usa JwtService para firmar
    return this.jwtService.sign({ sub: user._id }, { secret, expiresIn });
  }

  // Usa ConfigService para obtener secreto al verificar
  verifyRefreshToken(token: string): { sub: string } | null {
    try {
      const secret = this.configService.get<string>('REFRESH_SECRET');
      if (!secret) {
        throw new InternalServerErrorException('Error de configuración del servidor.');
      }
      // Usa la verificación de JwtService
      return this.jwtService.verify(token, { secret }) as { sub: string };
    } catch (error) {

      return null;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken); // Ya usa ConfigService
    if (!payload) {

      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Usuario no encontrado o refresh token no establecido');
    }


    const match = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!match) {

      throw new UnauthorizedException('Refresh token no coincide');
    }

    const newAccessToken = this.generateJwt({
      _id: (user._id as string).toString(),
      email: user.email,
    });
    const newRefreshToken = this.generateRefreshToken({
      _id: (user._id as string).toString(),
    });

    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.usersService.updateRefreshToken(
      (user._id as string).toString(),
      hashedNewRefreshToken,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async revokeRefreshToken(userId: string) {

    await this.usersService.updateRefreshToken(userId, null);
  }

  async forgotPassword(email: string) {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const user = await this.usersService.findByEmail(normalizedEmail);
      if (!user) throw new NotFoundException('Usuario no encontrado');

      const token = crypto.randomBytes(32).toString('hex');
      const expireDate = new Date(Date.now() + 1000 * 60 * 15); // 15 minutos

      await this.usersService.saveResetToken(
        (user._id as string).toString(), // Asegúrate de usar el ID como string
        token,
        expireDate,
      );


      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4000';
      const resetLink = `${frontendUrl}/auth/reset-password?token=${token}`;

      await this.mailService.sendResetPasswordEmail(user.email, token);
    } catch (error) {
      console.error('Error forgotPassword:', error);
      throw new InternalServerErrorException('Error al procesar la solicitud de restablecimiento');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.usersService.findResetToken(token);

    if (!resetToken) {
      throw new UnauthorizedException('Token inválido o no encontrado');
    }

    const currentTime = new Date();
    if (resetToken.expires < currentTime) {
      await this.usersService.deleteResetToken(resetToken.token); // Elimina expirado
      throw new UnauthorizedException('El token ha expirado');
    }

    // Verificar que la nueva contraseña no esté ya hasheada
    if (newPassword.startsWith('$2b$') || newPassword.length > 60) {
      // Cambiado a BadRequestException
      throw new BadRequestException('Formato de contraseña inválido.');
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

    // Ensure resetToken includes userId or fetch the userId separately
    const userId = resetToken['userId']; // Ensure 'userId' is included in the resetToken object
    if (!userId) {
      throw new InternalServerErrorException('No se pudo encontrar el usuario asociado al token');
    }

    const user = await this.usersService.updatePassword(
      userId,
      hashedPassword,
    );

    if (!user) {
      throw new InternalServerErrorException('No se pudo actualizar la contraseña del usuario');
    }

    await this.usersService.deleteResetToken(resetToken.token); // Asume que resetToken.token existe

    return { message: 'Contraseña actualizada correctamente' };
  } // Fin de resetPassword

  async validateOAuthLogin(profile: {
    emails?: { value: string }[];
    displayName?: string;
    provider?: string;
  }): Promise<{ user: any; accessToken: string }> {
    const user = await this.usersService.findOrCreateOAuthUser(profile);

    const payload = { sub: user._id, email: user.email, name: user.name };
    const expiresIn = this.configService.get<string>('JWT_EXPIRATION') || '1d'; // O la expiración deseada para OAuth
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    return {
      user: { _id: user._id, email: user.email, name: user.name }, // Devuelve solo datos seguros
      accessToken
    };
  }
}

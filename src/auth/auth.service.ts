import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

import { CreateUserDto } from '../users/dto/create-user.dto';
import { User, UserDocument } from '../users/entities/user.entity'; // Adjust the path if necessary

@Injectable()
export class AuthService {
  private refreshSecret: string;

  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    private usersService: UsersService,
  ) {
    this.refreshSecret = process.env.REFRESH_SECRET || 'default_refresh_secret';
  }
  async register(createUserDto: CreateUserDto) {
    // Normalizar email
    createUserDto.email = createUserDto.email.trim().toLowerCase();

    // Verificar si el usuario ya existe
    const userExists = await this.usersService.findByEmail(createUserDto.email);
    if (userExists) {
      throw new Error('El email ya está registrado');
    }

    // Verificar que la contraseña no esté ya hasheada
    if (
      createUserDto.password?.startsWith('$2b$') ||
      createUserDto.password && createUserDto.password.length > 60
    ) {
      throw new Error('La contraseña ya parece estar hasheada');
    }

    console.log('Registrando usuario con email:', createUserDto.email);

    // Crear el nuevo usuario
    const newUser = (await this.usersService.create(
      createUserDto,
    )) as UserDocument; // Aseguramos que `newUser` sea de tipo `UserDocument`

    if (!newUser || !newUser._id) {
      throw new InternalServerErrorException('Error creating user');
    }

    // Generar JWT
    const tokens = this.generateJwt({
      _id: (
        newUser._id as unknown as {
          toHexString: () => string;
        }
      ).toHexString(),
      email: newUser.email,
    });

    return { user: newUser, tokens };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user) {
      console.log('Usuario no encontrado');
      return null;
    }

    if (!user.password || user.password.length < 10) {
      console.log('Contraseña inválida o vacía');
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      password.trim(),
      user.password,
    );
    console.log('Contraseña ingresada:', password.trim());
    console.log('Contraseña hasheada:', user.password);
    console.log('Resultado de la comparación:', isPasswordValid);
    if (!isPasswordValid) {
      console.log('La contraseña no es válida');
      return null;
    }

    console.log('La contraseña es válida');
    return user;
  }

  generateJwt(user: { _id: string; email: string }, mfa: boolean = false) {
    return jwt.sign(
      {
        sub: user._id,
        email: user.email,
        mfa,
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '15m' },
    );
  }

  generateRefreshToken(user: { _id: string }) {
    return jwt.sign({ sub: user._id }, this.refreshSecret, { expiresIn: '7d' });
  }

  verifyRefreshToken(token: string): { sub: string } | null {
    try {
      return jwt.verify(token, this.refreshSecret) as { sub: string };
    } catch {
      return null;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    const payload: { sub: string } | null =
      this.verifyRefreshToken(refreshToken);
    if (!payload) return null;

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.hashedRefreshToken) return null;

    const match = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!match) return null;

    const newAccessToken = this.generateJwt({
      _id: user._id as string,
      email: user.email,
    });
    const newRefreshToken = this.generateRefreshToken({
      _id: user._id as string,
    });

    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.usersService.updateRefreshToken(
      user._id as string,
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
        String(user.id),
        token,
        expireDate,
      );

      const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;

      await this.mailService.sendMail({
        to: user.email,
        subject: 'Restablece tu contraseña',
        text: `Haz clic aquí para restablecer tu contraseña: ${resetLink}`,
      });
    } catch (error) {
      console.error('Error forgotPassword:', error);
      throw new InternalServerErrorException('Error al procesar la solicitud');
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = (await this.usersService.findResetToken(token)) as {
      token: string;
      expires: Date;
      userId: string;
    };

    if (!resetToken) {
      throw new NotFoundException('Token no encontrado');
    }

    const currentTime = new Date();
    if (resetToken.expires < currentTime) {
      throw new UnauthorizedException('El token ha expirado');
    }

    // Verificar que la nueva contraseña no esté ya hasheada
    if (newPassword.startsWith('$2b$') || newPassword.length > 60) {
      throw new Error('La nueva contraseña ya parece estar hasheada');
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    const user = await this.usersService.updatePassword(
      resetToken.userId,
      hashedPassword,
    );

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.usersService.deleteResetToken(resetToken.token);

    return { message: 'Contraseña actualizada correctamente' };
  }

  async validateOAuthLogin(profile: {
    emails?: { value: string }[];
    displayName?: string;
    provider?: string;
  }): Promise<{ user: any; accessToken: string }> {
    const user = await this.usersService.findOrCreateOAuthUser(profile);

    const payload = { sub: user._id, email: user.email, name: user.name };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
    });

    return { user, accessToken };
  }
}

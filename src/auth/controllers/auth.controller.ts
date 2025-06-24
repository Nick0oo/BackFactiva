import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  UseGuards,
  Body,
  UnauthorizedException,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { LoginDto } from '../dto/login.dto';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { MfaService } from '../../mfa/mfa.service';
import { JwtAuthGuard } from '../../jwt/jwt-auth.guard';
import { VerifyMfaDto } from '../../mfa/verify-mfa.dto';
import * as speakeasy from 'speakeasy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly mfaService: MfaService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Inicia la redirección a Google
  }

  @Get('callback/google') // <-- Cambia 'google/redirect' a 'callback/google'
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(
    @Req() req: { user?: { jwt?: string; jwtToken?: string; user?: any } },
    @Res() res: Response,
  ) {
    if (!req.user || !req.user.jwt) { // Asegúrate que 'jwt' es lo que realmente viene de GoogleStrategy
       // Considera cambiar req.user.jwt a req.user.jwtToken si eso es lo que devuelve tu strategy
       console.error('Fallo en callback de Google: No se encontró req.user.jwt o req.user', req.user);
       return res.status(401).json({ message: 'Autenticación fallida - Faltan datos del usuario' });
    }

    // Asegúrate que la propiedad correcta (jwt o jwtToken) se usa aquí
    const token = req.user.jwt || req.user.jwtToken;
    if (!token) {
       console.error('Fallo en callback de Google: No se encontró token en req.user', req.user);
       return res.status(401).json({ message: 'Autenticación fallida - Token no generado' });
    }

    // Usa la variable FRONTEND_URL del .env para la redirección
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4000'; // Usa 4000 como fallback si no está en .env
    return res.redirect(
      `${frontendUrl}/auth/callback?token=${token}`, // Redirige al frontend
    );
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    // Validación de que email y password estén presentes
    if (!body.email || !body.password) {
      throw new UnauthorizedException(
        'El email y la contraseña son obligatorios',
      );
    }

    // Buscar el usuario en la base de datos
    const user = await this.usersService.findByEmail(body.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    // Comparar la contraseña
    if (!user.password) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    const passwordMatch = await bcrypt.compare(body.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificar si MFA está habilitado
    const mfaRequired = user.isMfaEnabled;

    // Generar JWT
    const accessToken = this.authService.generateJwt(
      { _id: user._id as string, email: user.email },
      !mfaRequired,
    );

    // Generar Refresh Token
    const refreshToken = this.authService.generateRefreshToken({
      _id: user._id as string,
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(
      user._id as string,
      hashedRefreshToken,
    );
    // Devolver respuesta
    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      tokens: { accessToken, refreshToken }, // Tokens como un solo campo
      mfaRequired, // Se indica si MFA es necesario
    };
  }
    @Options('login')
  handleLoginOptions(@Req() req: Request, @Res() res: Response) {
    res.header('Access-Control-Allow-Origin', '*'); // Puedes restringirlo a tu frontend si prefieres
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    return res.sendStatus(204);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    try {
      // Registra al nuevo usuario y genera un token
      const { user, tokens } = await this.authService.register(createUserDto);

      // Configura la cookie con HttpOnly
      return res.status(201).json({
        message: 'Usuario creado exitosamente',
        user,
        tokens,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al crear el usuario';
      throw new UnauthorizedException(errorMessage);
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard) // Requiere estar autenticado
  async setup(@Req() req: { user: { _id: string } }) {
    const user = await this.usersService.findById(req.user._id);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Generar el secreto MFA
    const result = await this.mfaService.generateSecret(user.email); // Usa await aquí
    const { secret, otpauth } = result;

    // Guardar el secreto en la base de datos
    user.mfaSecret = secret;
    user.isMfaEnabled = true; // Activamos MFA para el usuario
    await this.usersService.updateUser(user._id as string, user);

    // Generar código QR
    const qrCode = await this.mfaService.generateQrCode(otpauth);
    return {
      message: 'Configuración de MFA iniciada correctamente',
      qrCode, // Este código QR lo envías al cliente para que lo escaneen
      secret, // El secreto lo guardamos en el backend y el cliente solo lo necesita al principio.
    };
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard) // Necesita un token válido (con mfa: false)
  async verifyMfa(
    @Req() req: { user: { _id: string } },
    @Body() body: VerifyMfaDto,
  ) {
    const userId = req.user?._id;
    if (!userId) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    const user = await this.usersService.findById(userId);

    if (!user || !user.mfaSecret) {
      throw new UnauthorizedException(
        'No se ha configurado MFA para este usuario',
      );
    }

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: body.code,
    });

    if (!isValid) {
      throw new UnauthorizedException('Código MFA inválido');
    }

    // Código válido → generar nuevo JWT con mfa: true
    const accessToken = this.authService.generateJwt(
      { _id: user._id as string, email: user.email },
      true,
    );

    return {
      message: 'Autenticación MFA verificada exitosamente',
      accessToken,
    };
  }
}

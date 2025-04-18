import { Controller, Post, Req, Res, UseGuards, Body, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { JwtAuthGuard } from '../../jwt/jwt-auth.guard';
import { AuthService } from '../auth.service';

@Controller('auth')
export class SessionController {
  constructor(private readonly authService: AuthService) {}

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req, @Res() res: Response) {
    const user = req.user;
    // Revocar el refresh token (si se guarda en la base de datos)
    await this.authService.revokeRefreshToken(user.sub);

    // Eliminar la cookie HttpOnly
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo en producción
      sameSite: 'strict',
    });

    return res.status(200).json({ message: 'Sesión cerrada exitosamente' });
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken; // Obtenemos el refresh token desde la cookie

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token no proporcionado');
    }

    const newTokens = await this.authService.refreshAccessToken(refreshToken);
    if (!newTokens) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    // Establecer nueva cookie HttpOnly
    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo en producción
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    return res.status(200).json({
      accessToken: newTokens.accessToken,
    });
  }
}

import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service'; // Asegúrate de importar el AuthService

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  login(
    @Request() req: { user: { id: string; username: string; email: string } },
  ): Promise<{
    user: { id: string; username: string; email: string };
    accessToken: string;
  }> {
    // Genera el JWT
    const accessToken = this.authService.generateJwt({
      _id: req.user.id,
      email: req.user.email,
    });

    // Devuelve el usuario y el JWT
    return Promise.resolve({
      user: req.user,
      accessToken,
    });
  }
}

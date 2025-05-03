import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service'; // Asegúrate de importar el AuthService

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}


}

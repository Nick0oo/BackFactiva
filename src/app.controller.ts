import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  @UseGuards(AuthGuard('local'))
  @Post('auth/login')
  login(
    @Request() req: { user: { id: string; username: string; email: string } },
  ): { id: string; username: string; email: string } {
    return req.user;
  }
}

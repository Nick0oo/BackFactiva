import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post('send-reset-password')
  async sendResetPasswordEmail(
    @Body('email') email: string,
    @Body('token') token: string,
  ) {
    await this.mailService.sendResetPasswordEmail(email, token);
    return { message: 'Correo de restablecimiento enviado correctamente' };
  }

  @Post('send')
  async sendMail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('text') text: string,
    @Body('html') html?: string,
  ) {
    await this.mailService.sendMail({ to, subject, text, html });
    return { message: 'Correo enviado correctamente' };
  }
}
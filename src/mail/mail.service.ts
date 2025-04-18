// src/mail/mail.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendResetPasswordEmail(email: string, token: string) {
    try {
      const resetUrl = `http://localhost:4200/reset-password?token=${token}`;

      await this.mailerService.sendMail({
        to: email,
        subject: 'Recupera tu contraseña',
        text: `Haz clic en este enlace para restablecer tu contraseña: ${resetUrl}`,
        html: `<p>Haz clic aquí para restablecer tu contraseña:</p><a href="${resetUrl}">${resetUrl}</a>`,
      });
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      throw new InternalServerErrorException('Error al enviar el correo');
    }
  }
  async sendMail(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      throw new InternalServerErrorException('Error al enviar el correo');
    }
  }
}

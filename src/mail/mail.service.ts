// filepath: <tu-proyecto-backend>/src/mail/mail.service.ts
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend'; // Importa Resend

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ??
      (() => {
        this.logger.error('RESEND_FROM_EMAIL no está configurado en .env');
        throw new Error('Configuración incompleta: Falta RESEND_FROM_EMAIL.');
      })();

    if (!apiKey) {
      this.logger.error('RESEND_API_KEY no está configurada en .env');
      throw new Error('Configuración incompleta: Falta RESEND_API_KEY.');
    }
    if (!this.fromEmail) {
      this.logger.error('RESEND_FROM_EMAIL no está configurado en .env');
      throw new Error('Configuración incompleta: Falta RESEND_FROM_EMAIL.');
    }

    this.resend = new Resend(apiKey);
    this.logger.log('Servicio de Mail (Resend) inicializado.');
  }

  /**
   * Envía un correo electrónico usando Resend.
   * @param options Opciones del correo: to, subject, html, text (opcional)
   */
  async sendMail(options: {
    to: string | string[]; // Resend permite enviar a múltiples destinatarios
    subject: string;
    html?: string; // Resend prefiere HTML, pero text es opcional
    text?: string;
  }): Promise<void> {
    this.logger.log(
      `Intentando enviar correo a: ${Array.isArray(options.to) ? options.to.join(', ') : options.to} con asunto: ${options.subject}`,
    );

    try {
      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html, // Asegúrate de enviar contenido HTML si es posible
        text: options.text ?? '', // Proporciona un valor predeterminado si text es undefined
      });

      if (error) {
        this.logger.error('Error al enviar correo con Resend:', error);
        throw new InternalServerErrorException(
          `Error al enviar correo: ${error.message}`,
        );
      }

      this.logger.log(
        `Correo enviado exitosamente a ${Array.isArray(options.to) ? options.to.join(', ') : options.to}. ID: ${data?.id}`,
      );
    } catch (exception) {
      this.logger.error('Excepción al intentar enviar correo:', exception);
      // Lanza una excepción más genérica o maneja según necesites
      if (exception instanceof InternalServerErrorException) {
        throw exception; // Re-lanza la excepción específica de Resend si ya fue lanzada
      }
      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al enviar el correo.',
      );
    }
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const frontendBaseUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendBaseUrl) {
      this.logger.error('FRONTEND_URL no está configurado en .env');
      throw new InternalServerErrorException(
        'La URL del frontend no está configurada.',
      );
    }
    const resetUrl = `${frontendBaseUrl}/reset-password?token=${token}`;

    const subject = 'Recupera tu contraseña';
    const html = `<p>Recibiste este correo porque solicitaste restablecer tu contraseña.</p>
                  <p>Haz clic en el siguiente enlace para continuar:</p>
                  <a href="${resetUrl}" target="_blank" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Restablecer mi contraseña</a>
                  <p>Si no solicitaste esto, puedes ignorar este correo.</p>
                  <p>El enlace expirará en 15 minutos.</p>`;
    const text = `Recibiste este correo porque solicitaste restablecer tu contraseña. Copia y pega este enlace en tu navegador para continuar: ${resetUrl} Si no solicitaste esto, puedes ignorar este correo. El enlace expirará en 15 minutos.`;

    await this.sendMail({ to: email, subject, html, text });
  }
}

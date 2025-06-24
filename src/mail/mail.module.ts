// src/mail/mail.module.ts

import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { ConfigService, ConfigModule } from '@nestjs/config'; // Asegúrate que ConfigModule esté importado si MailService lo necesita

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get<string>('MAIL_HOST'),
            port: configService.get<number>('MAIL_PORT'),
            secure: configService.get<string>('MAIL_SECURE') === 'true', // ← importante
            auth: {
              user: configService.get<string>('MAIL_USER'),
              pass: configService.get<string>('MAIL_PASS'),
            },
          },
          defaults: {
            from: configService.get<string>('MAIL_FROM'),
          },
        };
      },
    }),
    ConfigModule, // Importa ConfigModule si MailService inyecta ConfigService
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

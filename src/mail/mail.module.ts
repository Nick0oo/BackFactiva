// src/mail/mail.module.ts

import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        MailerModule.forRootAsync({
          useFactory: async (configService: ConfigService) => ({
            transport: {
              host: configService.get('MAIL_HOST'),
              port: parseInt(configService.get('MAIL_PORT') || '2525', 10),
              auth: {
                user: configService.get('MAIL_USER'),
                pass: configService.get('MAIL_PASS'),
              },
            },
            defaults: {
              from: '"Soporte" <soporte@tuapp.com>',
            },
          }),
          inject: [ConfigService],
        }),
      ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}


 

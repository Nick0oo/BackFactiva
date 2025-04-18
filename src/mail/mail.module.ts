// src/mail/mail.module.ts

import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mailConfig = configService.get<{
          mailHost: string;
          mailPort: number;
          mailUser: string;
          mailPass: string;
          mailfrom: string;
        }>('mail');
        return {
          transport: {
            host:
              mailConfig?.mailHost ??
              (() => {
                throw new Error('Mail configuration is missing');
              })(),
            port: mailConfig.mailPort,
            auth: {
              user: mailConfig.mailUser,
              pass: mailConfig.mailPass,
            },
          },
          defaults: {
            from: mailConfig.mailfrom,
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}

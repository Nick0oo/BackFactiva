import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { MfaModule } from './mfa/mfa.module';

import {
  appConfig,
  databaseConfig,
  googleConfig,
  jwtConfig,
  mailConfig,
} from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, mailConfig, googleConfig],
    }),

    // Configuración dinámica de Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const uri = await Promise.resolve(
          configService.get<string>('database.uri'),
        );
        return {
          uri,
          serverApi: {
            version: '1',
          },
        };
      },
    }),
    AuthModule,
    UsersModule,
    MailModule,
    MfaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

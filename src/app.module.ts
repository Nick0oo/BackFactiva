import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ¡Añade ConfigService aquí!
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { MfaModule } from './mfa/mfa.module';
import { DashboardModule } from './dashboard/dashboard.module';

import * as config from './config';
import { RolesModule } from './users/roles/roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [config.appConfig, config.databaseConfig, config.jwtConfig, config.mailConfig, config.googleConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: await Promise.resolve(configService.get<string>('database.uri')),
        serverApi: { version: '1' },
      }),
    }),
    DashboardModule,
    AuthModule,
    UsersModule,
    MailModule,
    MfaModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
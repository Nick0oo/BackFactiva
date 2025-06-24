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
import { FactusService } from './factus/factus.service';
import { FactusModule } from './factus/factus.module';
import { HttpModule } from '@nestjs/axios';

/**
 * Main application module.
 * This module is responsible for:
 * - Loading configuration
 * - Connecting to the database
 * - Importing and exporting modules
 * - Defining controllers and providers
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        config.appConfig,
        config.databaseConfig,
        config.jwtConfig,
        config.mailConfig,
        config.googleConfig,
      ],
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
    FactusModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, FactusService],
})
export class AppModule {}
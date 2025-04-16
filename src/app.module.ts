import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true,

  }), AuthModule, UsersModule, MongooseModule.forRoot('mongodb://localhost/nest'), MailModule],


  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

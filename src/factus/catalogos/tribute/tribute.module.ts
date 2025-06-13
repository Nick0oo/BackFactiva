import { Module } from '@nestjs/common';
import { TributeController } from './tribute.controller';
import { TributeService } from './tribute.service';
import { HttpModule } from '@nestjs/axios';
import { FactusModule } from 'src/factus/factus.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    FactusModule,
    ConfigModule
  ],
  controllers: [TributeController],
  providers: [TributeService],
  exports: [TributeService],
})
export class TributeModule {}

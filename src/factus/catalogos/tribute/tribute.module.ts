import { Module } from '@nestjs/common';
import { TributeController } from './tribute.controller';
import { TributeService } from './tribute.service';
import { HttpModule } from '@nestjs/axios';
import { FactusModule } from 'src/factus/factus.module';

@Module({
  imports: [
    HttpModule,
    FactusModule
  ],
  controllers: [TributeController],
  providers: [TributeService],
  exports: [TributeService],
})
export class TributeModule {}

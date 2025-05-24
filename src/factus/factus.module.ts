// factus.module.ts
import { Module } from '@nestjs/common';
import { FactusService } from './factus.service';
import { FactusController } from './factus.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule,],
  providers: [FactusService],
  exports: [FactusService],
  controllers: [FactusController]
})
export class FactusModule {}
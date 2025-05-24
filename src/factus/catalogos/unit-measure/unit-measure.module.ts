import { Module } from '@nestjs/common';
import { UnitMeasureService } from './unit-measure.service';
import { UnitMeasureController } from './unit-measure.controller';
import { HttpModule } from '@nestjs/axios';
import { FactusModule } from 'src/factus/factus.module';

@Module({
  imports: [
   HttpModule,
   FactusModule
  ],
  controllers: [UnitMeasureController],
  providers: [UnitMeasureService],
  exports: [UnitMeasureService],
})
export class UnitMeasureModule {}

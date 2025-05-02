// factus.module.ts
import { Module } from '@nestjs/common';
import { FactusService } from './factus.service';
import { FactusController } from './factus.controller';
import { HttpModule } from '@nestjs/axios';
import { UnitMeasureModule } from './catalogos/unit-measure/unit-measure.module';

@Module({
  imports: [HttpModule, UnitMeasureModule,],
  providers: [FactusService],
  exports: [FactusService],
  controllers: [FactusController]
})
export class FactusModule {}
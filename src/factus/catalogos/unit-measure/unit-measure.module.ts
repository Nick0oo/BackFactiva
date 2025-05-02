import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitMeasureService } from './unit-measure.service';
import { UnitMeasureController } from './unit-measure.controller';
import { UnitMeasure, UnitMeasureSchema } from './entities/unit-measure.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UnitMeasure.name, schema: UnitMeasureSchema }]),HttpModule
  ],
  controllers: [UnitMeasureController],
  providers: [UnitMeasureService],
  exports: [UnitMeasureService],
})
export class UnitMeasureModule {}

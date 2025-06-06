import { Controller, Get, Post, Body } from '@nestjs/common';
import { UnitMeasureService } from './unit-measure.service';
import { UnitMeasure } from './dto/unit-measure.dto';

@Controller('unit-measure')
export class UnitMeasureController {
  constructor(private readonly unitMeasureService: UnitMeasureService) {}
  @Get()
  findAll(): Promise<UnitMeasure[]> {
    return this.unitMeasureService.findAll();
  }
}


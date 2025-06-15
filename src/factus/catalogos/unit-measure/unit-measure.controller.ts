import { Controller, Get } from '@nestjs/common';
import { UnitMeasureService } from './unit-measure.service';
import { UnitMeasure } from './dto/unit-measure.dto';

@Controller('catalogs/unit-measures')
export class UnitMeasureController {
  constructor(private readonly unitMeasureService: UnitMeasureService) {}
  @Get()
  findAll(): Promise<UnitMeasure[]> {
    return this.unitMeasureService.findAll();
  }
}


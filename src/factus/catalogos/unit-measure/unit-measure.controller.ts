import { Controller, Get, Post, Body } from '@nestjs/common';
import { UnitMeasureService } from './unit-measure.service';
import { CreateUnitMeasureDto } from './dto/create-unit-measure.dto';

@Controller('unit-measure')
export class UnitMeasureController {
  constructor(private readonly unitMeasureService: UnitMeasureService) {}

  @Get()
  findAll() {
    return this.unitMeasureService.findAll();
  }

  @Post()
  create(@Body() createUnitDto: CreateUnitMeasureDto) {
    return this.unitMeasureService.create(createUnitDto);
  }
}

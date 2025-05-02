import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { StandardCodeService } from './standard-code.service';
import { CreateStandardCodeDto } from './dto/create-standard-code.dto';
import { StandardCodeType } from './standard-code.enum';

@Controller('standard-code')
export class StandardCodeController {
  constructor(private readonly standardCodeService: StandardCodeService) {}

  @Post()
  create(@Body() createDto: CreateStandardCodeDto) {
    return this.standardCodeService.create(createDto);
  }

  @Get()
  findAll() {
    return this.standardCodeService.findAll();
  }

  @Get(':type')
  findByType(@Param('type') type: StandardCodeType) {
    return this.standardCodeService.findByType(type);
  }
}

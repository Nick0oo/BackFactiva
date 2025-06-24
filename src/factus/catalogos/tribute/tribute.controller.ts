import { Controller, Get } from '@nestjs/common';
import { TributeService } from './tribute.service';
import { Tribute } from './dto/create-tributes.dto';

@Controller('catalogs/tributes')
export class TributeController {
  constructor(private readonly tributeService: TributeService) {}
  @Get()
  findAll(): Promise<Tribute[]> {
    return this.tributeService.findAll();
  }
}

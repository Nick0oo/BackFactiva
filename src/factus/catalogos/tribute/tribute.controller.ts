import { Controller } from '@nestjs/common';
import { TributeService } from './tribute.service';
import { Get } from '@nestjs/common';
import { Tribute } from './dto/create-tributes.dto';

@Controller('tribute')
export class TributeController {
  constructor(private readonly tributeService: TributeService) {}
  @Get()
  findAll(): Promise<Tribute[]> {
    return this.tributeService.findAll();
  }
}

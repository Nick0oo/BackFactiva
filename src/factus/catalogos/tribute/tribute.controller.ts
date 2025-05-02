import { Controller } from '@nestjs/common';
import { TributeService } from './tribute.service';

@Controller('tribute')
export class TributeController {
  constructor(private readonly tributeService: TributeService) {}
}

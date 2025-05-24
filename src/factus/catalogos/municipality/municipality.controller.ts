import { Controller, Get } from '@nestjs/common';
import { MunicipalityService } from './municipality.service';
import { Municipality } from './dto/municipality.dto';

@Controller('municipality')
export class MunicipalityController {
    constructor(private readonly municipalityService: MunicipalityService) {}
    @Get()
    findAll(): Promise<Municipality[]> {
         return this.municipalityService.findAll();
     }
}

import { Controller, Get, Param } from '@nestjs/common';
import { MunicipalityService } from './municipality.service';
import { Municipality } from './dto/municipality.dto';

@Controller('municipality')
export class MunicipalityController {
    constructor(private readonly municipalityService: MunicipalityService) {}

    @Get()
    findAll(): Promise<Municipality[]> {
        return this.municipalityService.findAll();
    }

    @Get('department/:departmentName')
    findByDepartment(@Param('departmentName') departmentName: string): Promise<Municipality[]> {
        return this.municipalityService.findByDepartment(departmentName);
    }
}

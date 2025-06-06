import { Controller, Get, Query, NotFoundException, Param } from '@nestjs/common';
import { MunicipalityService } from './municipality.service';
import { Municipality } from './dto/municipality.dto';

@Controller('municipality')
export class MunicipalityController {
    constructor(private readonly municipalityService: MunicipalityService) {}

    @Get()
    findAll(): Promise<Municipality[]> {
        return this.municipalityService.findAll();
    }

    @Get('departments')
    async findAllDepartments(): Promise<string[]> {
        const departments = await this.municipalityService.findAllDepartments();
        if (!departments || departments.length === 0) {
            throw new NotFoundException('No se encontraron departamentos');
        }
        return departments;
    }

    @Get('department/:department')
    async findByDepartment(@Param('department') department: string): Promise<Municipality[]> {
        const municipalities = await this.municipalityService.findByDepartment(department);
        if (!municipalities || municipalities.length === 0) {
            throw new NotFoundException(`No se encontraron municipios para el departamento ${department}`);
        }
        return municipalities;
    }
}

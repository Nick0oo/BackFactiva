import { Injectable, OnModuleInit } from '@nestjs/common';
import { Municipality } from './dto/municipality.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FactusService } from 'src/factus/factus.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MunicipalityService implements OnModuleInit {
    private municipalities: Municipality[] = [];
    private readonly baseUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly factusService: FactusService,
        private readonly configService: ConfigService
    ) {
        this.baseUrl = this.configService.get<string>('FACTUS_BASE_URL') ?? 'https://api-sandbox.factus.com.co';
    }

    async onModuleInit() {
        await this.syncFromFactus();
    }

    async syncFromFactus() {
        try {
            // Obtener token válido usando el servicio existente
            const token = await this.factusService.getValidAccessToken();

            // Hacer la solicitud con el token en el header
            const response = await firstValueFrom(
                this.httpService.get(`${this.baseUrl}/v1/municipalities`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json'
                    }
                }),
            );
            const municipalitiesData = Array.isArray(response.data)
                ? response.data
                : Array.isArray((response.data as any).data)
                    ? (response.data as any).data
                    : Object.values(response.data);

            this.municipalities = Array.isArray(municipalitiesData)
                ? municipalitiesData
                : [];

            if (this.municipalities.length > 0) {
            }
        } catch (error) {
            this.municipalities = []; // Inicializar como array vacío en caso de error
        }
    }
    async findAll(): Promise<Municipality[]> {
        return this.municipalities;
    }

    async findAllDepartments(): Promise<string[]> {
        try {
            if (!Array.isArray(this.municipalities)) {
                return [];
            }
            
            // Obtener departamentos únicos y ordenados
            const departments = [...new Set(
                this.municipalities
                    .filter(m => m && m.department && typeof m.department === 'string')
                    .map(m => m.department.trim())
            )].sort((a, b) => a.localeCompare(b, 'es'));

            // Verificar que tenemos departamentos
            if (departments.length === 0) {
                console.warn('No se encontraron departamentos en los datos');
                return [];
            }

            return departments;
        } catch (error) {
            console.error('Error al obtener departamentos:', error);
            return [];
        }
    }

    async findByName(name: string): Promise<Municipality | undefined> {
        try {
            if (!Array.isArray(this.municipalities)) {
                throw new Error('Municipalities is not an array');
            }
            const foundMunicipality = this.municipalities.find(m => {
                if (!m || typeof m !== 'object') {
                    return false;
                };

                const nameMunicipality = m.name || m.id;
                const stringName = String(nameMunicipality).trim().toUpperCase();
                const searchName = String(name).trim().toUpperCase();

                const isNameMatch = stringName === searchName;
                return isNameMatch;

            });
            return foundMunicipality;
        } catch (error) {
            return undefined;
        }
    }

    async departmentExists(departmentName: string): Promise<boolean> {
        try {
            if (!Array.isArray(this.municipalities)) {
                return false;
            }
            
            if (this.municipalities.length === 0) {
                return false;
            }

            // Normalizar búsqueda (sin tildes y todo en mayúscula)
            const normalizedSearch = this.normalizeText(String(departmentName));
            
            // Listar algunos departamentos para verificar
            const uniqueDepartments = [...new Set(
                this.municipalities
                    .filter(m => m && m.department) // CAMBIAR: departament → department
                    .map(m => m.department)        // CAMBIAR: departament → department
            )];
            
            // Buscar con mayor flexibilidad
            const found = this.municipalities.some(m => {
                if (!m || !m.department) return false; // CAMBIAR: departament → department
                
                const deptNormalized = this.normalizeText(String(m.department)); // CAMBIAR: departament → department
                const isExactMatch = deptNormalized === normalizedSearch;
                const isPartialMatch = deptNormalized.includes(normalizedSearch) || 
                                      normalizedSearch.includes(deptNormalized);
                
                return isExactMatch || isPartialMatch;
            });

            return found;
        } catch (error) {
            return false;
        }
    }

    async findByNameAndDepartment(municipalityName: string, departmentName: string): Promise<Municipality | undefined> {
        try {
            if (!Array.isArray(this.municipalities)) {
                return undefined;
            }

            const normalizedMunName = String(municipalityName).trim().toUpperCase();
            const normalizedDeptName = String(departmentName).trim().toUpperCase();

            const municipality = this.municipalities.find(m => {
                if (!m || typeof m !== 'object' || !m.name || !m.department) return false;
                
                const munName = String(m.name).trim().toUpperCase();
                const deptName = String(m.department).trim().toUpperCase();
                
                return munName === normalizedMunName && deptName === normalizedDeptName;
            });

            return municipality;
        } catch (error) {
            return undefined;
        }
    }

    async findByDepartment(departmentName: string): Promise<Municipality[]> {
        try {
            if (!Array.isArray(this.municipalities)) {
                return [];
            }

            const normalizedDeptName = String(departmentName).trim().toUpperCase();
            
            const municipalities = this.municipalities.filter(municipality => {
                if (!municipality || typeof municipality !== 'object') return false;
                
                const deptName = String(municipality.department).trim().toUpperCase();
                const match = deptName === normalizedDeptName;
                return match;
            });

            return municipalities;
        } catch (error) {
            return [];
        }
    }

    // Método auxiliar para normalizar texto (elimina tildes y convierte a mayúsculas)
    private normalizeText(text: string): string {
        return text.trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
            .toUpperCase();
    }
}

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Municipality } from './dto/municipality.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FactusService } from 'src/factus/factus.service';

@Injectable()
export class MunicipalityService implements OnModuleInit {
    private municipalities: Municipality[] = [];

    constructor(
        private readonly httpService: HttpService,
        private readonly factusService: FactusService
    ) { }

    async onModuleInit() {
        await this.syncFromFactus();
    }

    async syncFromFactus() {
        try {
            // Obtener token válido usando el servicio existente
            const token = await this.factusService.getValidAccessToken();

            // Hacer la solicitud con el token en el header
            const response = await firstValueFrom(
                this.httpService.get('https://api-sandbox.factus.com.co/v1/municipalities', {
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

            console.log(`✔️ municipios sincronizadas desde Factus: ${this.municipalities.length}`);
            if (this.municipalities.length > 0) {
                console.log('Ejemplo de municipio:', JSON.stringify(this.municipalities[0]).substring(0, 200));
            }
        } catch (error) {
            console.error('❌ Error al sincronizar municipios', error.message);
            this.municipalities = []; // Inicializar como array vacío en caso de error
        }
    }
    async findAll(): Promise<Municipality[]> {
        return this.municipalities;
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
                if (isNameMatch) {
                    console.log(`✔️ Municipio encontrado: ${stringName}`);
                }
                return isNameMatch;

            });
            return foundMunicipality;
        } catch (error) {
            console.error('Error al buscar municipio:', error.message);
            return undefined;
        }
    }

    async departmentExists(departmentName: string): Promise<boolean> {
        try {
            if (!Array.isArray(this.municipalities)) {
                console.warn('❌ municipalities no es un array:', typeof this.municipalities);
                return false;
            }
            
            if (this.municipalities.length === 0) {
                console.warn('❌ El array de municipios está vacío');
                return false;
            }

            // Normalizar búsqueda (sin tildes y todo en mayúscula)
            const normalizedSearch = this.normalizeText(String(departmentName));
            
            console.log(`🔍 Buscando departamento "${departmentName}" (normalizado: "${normalizedSearch}")`);
            console.log(`📊 Total municipios cargados: ${this.municipalities.length}`);
            
            // Listar algunos departamentos para verificar
            const uniqueDepartments = [...new Set(
                this.municipalities
                    .filter(m => m && m.department) // CAMBIAR: departament → department
                    .map(m => m.department)        // CAMBIAR: departament → department
            )];
            console.log(`📋 Primeros departamentos disponibles: ${uniqueDepartments.slice(0, 5).join(', ')}...`);
            
            // Buscar con mayor flexibilidad
            const found = this.municipalities.some(m => {
                if (!m || !m.department) return false; // CAMBIAR: departament → department
                
                const deptNormalized = this.normalizeText(String(m.department)); // CAMBIAR: departament → department
                const isExactMatch = deptNormalized === normalizedSearch;
                const isPartialMatch = deptNormalized.includes(normalizedSearch) || 
                                      normalizedSearch.includes(deptNormalized);
                
                if (isExactMatch || isPartialMatch) {
                    console.log(`✅ Departamento encontrado: "${m.department}" (${isExactMatch ? 'coincidencia exacta' : 'coincidencia parcial'})`);
                    return true;
                }
                return false;
            });

            return found;
        } catch (error) {
            console.error('Error checking department:', error.message);
            return false;
        }
    }

    async findByNameAndDepartment(municipalityName: string, departmentName: string): Promise<Municipality | undefined> {
        try {
            if (!Array.isArray(this.municipalities)) {
                console.warn('Municipalities is not an array');
                return undefined;
            }

            const normalizedMunName = String(municipalityName).trim().toUpperCase();
            const normalizedDeptName = String(departmentName).trim().toUpperCase();

            const municipality = this.municipalities.find(m => {
                if (!m || typeof m !== 'object' || !m.name || !m.department) return false; // CAMBIAR
                
                const munName = String(m.name).trim().toUpperCase();
                const deptName = String(m.department).trim().toUpperCase(); // CAMBIAR
                
                return munName === normalizedMunName && deptName === normalizedDeptName;
            });

            if (municipality) {
                console.log(`✅ Municipio "${municipalityName}" encontrado en departamento "${departmentName}"`);
            }

            return municipality;
        } catch (error) {
            console.error('Error buscando municipio en departamento:', error.message);
            return undefined;
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

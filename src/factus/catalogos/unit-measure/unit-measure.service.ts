import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UnitMeasure } from './dto/unit-measure.dto';
import { FactusService } from '../../factus.service';


@Injectable()
export class UnitMeasureService implements OnModuleInit {
  private unitMeasures: UnitMeasure[] = [];

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
        this.httpService.get('https://api-sandbox.factus.com.co/v1/measurement-units', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        }),
      );      
      const unitMeasuresData = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response.data as any).data)
          ? (response.data as any).data
          : Object.values(response.data); // Última opción: obtener valores del objeto
      
      // Asegurarse de que sea un array
      this.unitMeasures = Array.isArray(unitMeasuresData) 
        ? unitMeasuresData 
        : [];
      
      // Depuración: muestra la estructura de datos
      console.log(`✅ Unidades sincronizadas: ${this.unitMeasures.length}`);
      if (this.unitMeasures.length > 0) {
        console.log('Ejemplo de unidad:', JSON.stringify(this.unitMeasures[0]).substring(0, 200));
      }
    } catch (error) {
      console.error('❌ Error syncing unit measures:', error.message);
      this.unitMeasures = []; // Inicializar como array vacío en caso de error
    }
  }


  async findAll(): Promise<UnitMeasure[]> {
    return this.unitMeasures;
  }

  async findByCode(code: string): Promise<UnitMeasure | undefined> {
    try {
      // Verificación adicional para evitar errores
      if (!Array.isArray(this.unitMeasures)) {
        console.warn('⚠️ unitMeasures no es un array:', typeof this.unitMeasures);
        return undefined;
      }

      // Depuración para buscar el código
      console.log(`Buscando unidad con código: "${code}"`);
      
      const found = this.unitMeasures.find(unit => {
        if (!unit || typeof unit !== 'object') return false;
        
        // Buscar en diferentes propiedades posibles según los logs
        const unitCode = unit.code || unit.id;
        const stringCode = String(unitCode).trim().toUpperCase();
        const searchCode = String(code).trim().toUpperCase();
        
        const match = stringCode === searchCode;
        if (match) console.log('✅ Encontrado:', unit);
        
        return match;
      });
      
      return found; // Devuelve el objeto completo, no solo un booleano
    } catch (error) {
      console.error('Error al buscar unidad de medida:', error);
      return undefined;
    }
  }
}


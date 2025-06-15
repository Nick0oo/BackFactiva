import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UnitMeasure } from './dto/unit-measure.dto';
import { FactusService } from '../../factus.service';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class UnitMeasureService implements OnModuleInit {
  public unitMeasures: UnitMeasure[] = [];
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
        this.httpService.get(`${this.baseUrl}/v1/measurement-units`, {
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
      // console.log(`✅ Unidades sincronizadas: ${this.unitMeasures.length}`);
      // if (this.unitMeasures.length > 0) {
      //   console.log('Ejemplo de unidad:', JSON.stringify(this.unitMeasures[0]).substring(0, 200));
      // }
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
      if (!Array.isArray(this.unitMeasures)) {
        return undefined;
      }
      // Busca por code o por id (ambos como string)
      return this.unitMeasures.find(unit =>
        String(unit.code).toUpperCase() === String(code).toUpperCase() ||
        String(unit.id) === String(code)
      );
    } catch (error) {
      return undefined;
    }
  }

  async findById(id: string | number): Promise<UnitMeasure | undefined> {
    try {
      if (!Array.isArray(this.unitMeasures)) {
        // console.warn('⚠️ unitMeasures no es un array:', typeof this.unitMeasures);
        return undefined;
      }

      const idStr = String(id).trim();
      // console.log(`Buscando unidad con ID: "${idStr}"`);
      
      const found = this.unitMeasures.find(unit => {
        if (!unit || typeof unit !== 'object') return false;
        
        const unitId = String(unit.id).trim();
        const match = unitId === idStr;
        // if (match) console.log('✅ Encontrado por ID:', unit);
        
        return match;
      });
      
      return found;
    } catch (error) {
      console.error('Error al buscar unidad de medida por ID:', error);
      return undefined;
    }
  }
}


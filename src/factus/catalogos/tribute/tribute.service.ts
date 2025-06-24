import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Tribute } from './dto/create-tributes.dto';
import { FactusService } from 'src/factus/factus.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TributeService implements OnModuleInit {
  private tributes: Tribute[] = [];
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
        this.httpService.get(`${this.baseUrl}/v1/tributes/products?name=`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          }
        }),
      );
      const tributesData = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response.data as any).data)
          ? (response.data as any).data
          : Object.values(response.data); 

      this.tributes = Array.isArray(tributesData)
        ? tributesData
        : [];

      if (this.tributes.length > 0) {
        // console.log('Ejemplo de tributo:', JSON.stringify(this.tributes[0]).substring(0, 200));
      }
    } catch (error) {
      console.error('❌ Error al sincronizar tributos', error.message);
      this.tributes = []; // Inicializar como array vacío en caso de error
  }
}

  async findAll(): Promise<Tribute[]> {
    return this.tributes;
  }

  async findByCode(code: string): Promise<Tribute | undefined> {
    try {
      // Verificación adicional para evitar errores
      if (!Array.isArray(this.tributes)) {
        // console.warn('⚠️ tributes no es un array:', typeof this.tributes);
        return undefined;
      }

      // Depuración para buscar el código
      // console.log(`Buscando tributo con código: "${code}"`);
      
      const found = this.tributes.find(tribute => {
        if (!tribute || typeof tribute !== 'object') return false;
        
        // Buscar en diferentes propiedades posibles según los logs
        const tributeCode = tribute.code || tribute.id;
        const stringCode = String(tributeCode).trim().toUpperCase();
        const searchCode = String(code).trim().toUpperCase();
        
        const match = stringCode === searchCode;
        // if (match) console.log('✅ Encontrado:', tribute);
        
        return match;
      });
      
      return found;
    } catch (error) {
      console.error('Error al buscar tributo:', error);
      return undefined;
    }
  }

  async findById(id: string | number): Promise<Tribute | undefined> {
    try {
      if (!Array.isArray(this.tributes)) {
        // console.warn('⚠️ tributes no es un array:', typeof this.tributes);
        return undefined;
      }

      const idStr = String(id).trim();
      // console.log(`Buscando tributo con ID: "${idStr}"`);
      
      const found = this.tributes.find(tribute => {
        if (!tribute || typeof tribute !== 'object') return false;
        
        const tributeId = String(tribute.id).trim();
        const match = tributeId === idStr;
        // if (match) console.log('✅ Encontrado por ID:', tribute);
        
        return match;
      });
      
      return found;
    } catch (error) {
      console.error('Error al buscar tributo por ID:', error);
      return undefined;
    }
  }
}

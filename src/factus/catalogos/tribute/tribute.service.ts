import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Tribute } from './dto/create-tributes.dto';
import { FactusService } from 'src/factus/factus.service';

@Injectable()
export class TributeService implements OnModuleInit {
  private tributes: Tribute[] = [];

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
        this.httpService.get('https://api-sandbox.factus.com.co/v1/tributes/products?name=', {
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

      console.log(`✔️ tributos sincronizadas desde Factus: ${this.tributes.length}`);
      if (this.tributes.length > 0) {
        console.log('Ejemplo de tributo:', JSON.stringify(this.tributes[0]).substring(0, 200));
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
      if (!Array.isArray(this.tributes)) {
        throw new Error('La lista de tributos no está disponible.');
      }

      const foundTribute = this.tributes.find(tribute => {if (!tribute || typeof tribute !== 'object') return false;

      const tributeCode = tribute.code || tribute.id;
      const stringCode = String(tributeCode).trim().toUpperCase();
      const SearchCode = String(code).trim().toUpperCase();

      const isMatch = stringCode === SearchCode;
      if (isMatch) {
        console.log(`✔️ Código encontrado: ${stringCode}`);
      } 
      return isMatch;
   });
    return foundTribute;
   } catch (error) {
      console.error('❌ Error al buscar el código:', error.message);
      return undefined;
    }

   }
}

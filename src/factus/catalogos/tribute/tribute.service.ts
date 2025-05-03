import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateTributeDto } from './dto/create-tributes.dto';
import { firstValueFrom } from 'rxjs';
import { Tribute, TributeDocument } from './entities/tribute.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TributeService implements OnModuleInit {
  private tributes: CreateTributeDto[] = [];

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Tribute.name) private readonly tributeModel: Model<TributeDocument>,
  ) {}

  async onModuleInit() {
    await this.syncFromFactus();
  }

  async syncFromFactus() {
  /*  try {
      const { data } = await firstValueFrom(
        this.httpService.get('https://api-sandbox.factus.com.co/v1/tributes/products?name=')
      );

      this.tributes.length = 0;
      for (const item of data) {
        const dto: CreateTributeDto = {
          code: item.codigo,           // ajusta al nombre real del campo
          name: item.nombre,           // ajusta al nombre real del campo
          description: item.descripcion, // ajusta al nombre real del campo
        };
        this.tributes.push(dto);
      }

      console.log('✔️ tributos sincronizadas desde Factus');
    } catch (error) {
      console.error('❌ Error al sincronizar tributos', error.message);
    }*/
  }

  findAll() {
    return this.tributes;
  }

  async findById(id: string): Promise<TributeDocument> {
    const tribute = await this.tributeModel.findById(id).exec();
    if (!tribute) {
      throw new Error(`Tribute with id ${id} not found`);
    }
    return tribute;
  }

  create(unit: CreateTributeDto) {
    this.tributes.push(unit);
    return unit;
  }
}

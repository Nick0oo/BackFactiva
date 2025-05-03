import { Injectable, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateUnitMeasureDto } from './dto/create-unit-measure.dto';
import { firstValueFrom } from 'rxjs';
import { UnitMeasureDocument } from './entities/unit-measure.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UnitMeasure } from './entities/unit-measure.entity';

@Injectable()
export class UnitMeasureService implements OnModuleInit {
  private readonly unitMeasures: CreateUnitMeasureDto[] = [];

  constructor(private readonly httpService: HttpService,
    @InjectModel(UnitMeasure.name) private readonly unitMeasureModel: Model<UnitMeasureDocument>
  ) { }

  async onModuleInit() {
    await this.syncFromFactus();
  }

  async syncFromFactus() {
  /*  try {
      const { data } = await firstValueFrom(
        this.httpService.get('https://api-sandbox.factus.com.co/v1/measurement-units')
      );

      this.unitMeasures.length = 0;
      for (const item of data) {
        const dto: CreateUnitMeasureDto = {
          code: item.codigo,           // ajusta al nombre real del campo
          name: item.nombre,           // ajusta al nombre real del campo
          description: item.descripcion, // ajusta al nombre real del campo
        };
        this.unitMeasures.push(dto);
      }

      console.log('✔️ Unidades de medida sincronizadas desde Factus');
    } catch (error) {
      console.error('❌ Error al sincronizar unidades de medida', error.message);
    }*/
  }

  findAll() {
    return this.unitMeasures;
  }

  async findById(id: string): Promise<UnitMeasureDocument> {
    const unitMeasure = await this.unitMeasureModel.findById(id).exec();
    if (!unitMeasure) {
      throw new Error(`UnitMeasure with id ${id} not found`);
    }
    return unitMeasure;
  }

  create(unit: CreateUnitMeasureDto) {
    this.unitMeasures.push(unit);
    return unit;
  }
}

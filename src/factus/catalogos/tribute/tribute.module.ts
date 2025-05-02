import { Module } from '@nestjs/common';
import { TributeService } from './tribute.service';
import { TributeController } from './tribute.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Tribute } from './entities/tribute.entity';
import { TributeSchema } from './entities/tribute.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
   imports: [
      MongooseModule.forFeature([{ name: Tribute.name, schema: TributeSchema }]),HttpModule
    ],
  controllers: [TributeController],
  providers: [TributeService],
  exports: [TributeService],
})
export class TributeModule {}

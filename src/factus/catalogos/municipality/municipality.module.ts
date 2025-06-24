import { HttpModule } from '@nestjs/axios';
import { FactusModule } from 'src/factus/factus.module';
import { MunicipalityController } from './municipality.controller';
import { MunicipalityService } from './municipality.service';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        HttpModule,
        FactusModule,
        ConfigModule
    ],
    controllers: [MunicipalityController],
    providers: [MunicipalityService],
    exports: [MunicipalityService],
})
export class MunicipalityModule {}

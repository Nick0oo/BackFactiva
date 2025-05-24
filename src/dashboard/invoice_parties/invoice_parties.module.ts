import { Module } from '@nestjs/common';
import { InvoicePartiesController } from './invoice_parties.controller';
import { InvoicePartiesService } from './invoice_parties.service';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceParty, InvoicePartySchema } from './entities/invoice_party.entity'; 
import { JwtConfigModule } from 'src/jwt/jwt.module';
import { UsersModule } from 'src/users/users.module';
import { MunicipalityModule } from 'src/factus/catalogos/municipality/municipality.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: InvoiceParty.name, schema: InvoicePartySchema }]), JwtConfigModule, UsersModule, MunicipalityModule],
  controllers: [InvoicePartiesController],
  providers: [InvoicePartiesService],
  exports: [InvoicePartiesService],
})
export class InvoicePartiesModule {}
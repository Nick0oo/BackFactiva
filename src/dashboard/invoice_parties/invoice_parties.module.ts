import { Module } from '@nestjs/common';
import { InvoicePartiesController } from './invoice_parties.controller';
import { InvoicePartiesService } from './invoice_parties.service';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceParty, InvoicePartySchema } from './entities/invoice_party.entity'; // Importa la entidad y el esquema

@Module({
  imports: [MongooseModule.forFeature([{ name: InvoiceParty.name, schema: InvoicePartySchema }])],
  controllers: [InvoicePartiesController],
  providers: [InvoicePartiesService],
  exports: [InvoicePartiesService], // Exporta el servicio si lo necesitas en otros módulos
})
export class InvoicePartiesModule {}
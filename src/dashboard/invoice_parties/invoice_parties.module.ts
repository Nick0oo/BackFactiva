import { Module } from '@nestjs/common';
import { InvoicePartiesController } from './invoice_parties.controller';
import { InvoicePartiesService } from './invoice_parties.service';
import { MongooseModule } from '@nestjs/mongoose';
import { InvoiceParty, InvoicePartySchema } from './entities/invoice_party.entity'; // Importa la entidad y el esquema
import { JwtConfigModule } from 'src/jwt/jwt.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: InvoiceParty.name, schema: InvoicePartySchema }]), JwtConfigModule, UsersModule],
  controllers: [InvoicePartiesController],
  providers: [InvoicePartiesService],
  exports: [InvoicePartiesService], // Exporta el servicio si lo necesitas en otros módulos
})
export class InvoicePartiesModule {}
import { Module } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './entities/invoice.entity'; // Importa la entidad y el esquema
import { InvoicePartiesModule } from '../invoice_parties/invoice_parties.module'; // Importa el módulo de InvoiceParties
import { ProductsModule } from '../products/products.module';
import { UsersModule } from 'src/users/users.module';
import { JwtConfigModule } from 'src/jwt/jwt.module';
import { FactusModule } from 'src/factus/factus.module';
import { UnitMeasureModule } from 'src/factus/catalogos/unit-measure/unit-measure.module';
import { TributeModule } from 'src/factus/catalogos/tribute/tribute.module';
import { StandardCodeModule } from 'src/factus/catalogos/standard-code/standard-code.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Invoice.name, schema: InvoiceSchema }]), InvoicePartiesModule, ProductsModule, UsersModule, JwtConfigModule, FactusModule, UnitMeasureModule, TributeModule, StandardCodeModule], // Asegúrate de importar el módulo de InvoiceParties aquí
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService], // Exporta el servicio si lo necesitas en otros módulos
})
export class InvoiceModule {}
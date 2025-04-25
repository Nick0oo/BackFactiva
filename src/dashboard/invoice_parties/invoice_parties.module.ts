import { Module } from '@nestjs/common';
import { InvoicePartiesService } from './invoice_parties.service';
import { InvoicePartiesController } from './invoice_parties.controller';

@Module({
  controllers: [InvoicePartiesController],
  providers: [InvoicePartiesService],
})
export class InvoicePartiesModule {}

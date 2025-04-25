import { Injectable } from '@nestjs/common';
import { CreateInvoicePartyDto } from './dto/create-invoice_party.dto';
import { UpdateInvoicePartyDto } from './dto/update-invoice_party.dto';

@Injectable()
export class InvoicePartiesService {
  create(createInvoicePartyDto: CreateInvoicePartyDto) {
    return 'This action adds a new invoiceParty';
  }

  findAll() {
    return `This action returns all invoiceParties`;
  }

  findOne(id: number) {
    return `This action returns a #${id} invoiceParty`;
  }

  update(id: number, updateInvoicePartyDto: UpdateInvoicePartyDto) {
    return `This action updates a #${id} invoiceParty`;
  }

  remove(id: number) {
    return `This action removes a #${id} invoiceParty`;
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InvoicePartiesService } from './invoice_parties.service';
import { CreateInvoicePartyDto } from './dto/create-invoice_party.dto';
import { UpdateInvoicePartyDto } from './dto/update-invoice_party.dto';

@Controller('invoice-parties')
export class InvoicePartiesController {
  constructor(private readonly invoicePartiesService: InvoicePartiesService) {}

  @Post()
  create(@Body() createInvoicePartyDto: CreateInvoicePartyDto) {
    return this.invoicePartiesService.create(createInvoicePartyDto);
  }

  @Get()
  findAll() {
    return this.invoicePartiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoicePartiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInvoicePartyDto: UpdateInvoicePartyDto) {
    return this.invoicePartiesService.update(+id, updateInvoicePartyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoicePartiesService.remove(+id);
  }
}

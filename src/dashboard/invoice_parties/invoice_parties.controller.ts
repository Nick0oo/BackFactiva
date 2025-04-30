import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InvoicePartiesService } from './invoice_parties.service';
import { CreateInvoicePartyDto } from './dto/create-invoice_party.dto';
import { UpdateInvoicePartyDto } from './dto/update-invoice_party.dto';

@Controller('invoice-parties')
export class InvoicePartiesController {
  constructor(private readonly invoicePartiesService: InvoicePartiesService) {}

  @Post('receiver')
  async create(@Body() createInvoicePartyDto: CreateInvoicePartyDto) {
    return await this.invoicePartiesService.create(createInvoicePartyDto);
  }

  @Get()
  async findAll() {
    return await this.invoicePartiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) { // Asegúrate de que 'id' sea string
    return await this.invoicePartiesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateInvoicePartyDto: UpdateInvoicePartyDto) { // Asegúrate de que 'id' sea string
    return await this.invoicePartiesService.update(id, updateInvoicePartyDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) { // Asegúrate de que 'id' sea string
    return await this.invoicePartiesService.remove(id);
  }
}
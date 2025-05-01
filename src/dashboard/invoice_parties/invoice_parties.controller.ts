import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { InvoicePartiesService } from './invoice_parties.service';
import { CreateInvoicePartyDto } from './dto/create-invoice_party.dto';
import { UpdateInvoicePartyDto } from './dto/update-invoice_party.dto';
import { JwtAuthGuard } from '../../jwt/jwt-auth.guard'; 

@Controller('invoice-parties')
export class InvoicePartiesController {
  constructor(private readonly invoicePartiesService: InvoicePartiesService) {}

  @Post('receiver')
  @UseGuards(JwtAuthGuard) 
  async create(@Body() createInvoicePartyDto: CreateInvoicePartyDto) {
    return await this.invoicePartiesService.create(createInvoicePartyDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return await this.invoicePartiesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard) 
  async findOne(@Param('id') id: string) { // Asegúrate de que 'id' sea string
    return await this.invoicePartiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateInvoicePartyDto: UpdateInvoicePartyDto) { // Asegúrate de que 'id' sea string
    return await this.invoicePartiesService.update(id, updateInvoicePartyDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) { // Asegúrate de que 'id' sea string
    return await this.invoicePartiesService.remove(id);
  }
}
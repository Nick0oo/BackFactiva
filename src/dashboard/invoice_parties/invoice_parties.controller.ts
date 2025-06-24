import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { InvoicePartiesService } from './invoice_parties.service';
import { CreateInvoicePartyDto } from './dto/create-invoice_party.dto';
import { UpdateInvoicePartyDto } from './dto/update-invoice_party.dto';
import { JwtAuthGuard } from '../../jwt/jwt-auth.guard';
import { InvoiceParty } from './entities/invoice_party.entity'; 
import { UsersService } from '../../users/users.service'; // Importar el servicio de usuario
import { UnauthorizedException } from '@nestjs/common'; // Importar la excepción de no autorizado

@Controller('invoice-parties')
export class InvoicePartiesController {
  constructor(private readonly invoicePartiesService: InvoicePartiesService,
              private readonly userService: UsersService, // Inyectar el servicio de usuario 
  ) { } // Constructor del controlador

  @Post('receiver')
  @UseGuards(JwtAuthGuard)
  async create(@Body() createInvoicePartyDto: CreateInvoicePartyDto, @Req() req) {
   const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    // Obtener el ID del usuario logueado
    const issuerId = await this.userService.getUserIdFromToken(token);
    if (!issuerId) {
      throw new Error('El emisor es obligatorio');
    }
    return this.invoicePartiesService.create(createInvoicePartyDto, issuerId); // 2. Pasa el ID al servicio
  }

  @Get('user/:userId') // Ruta para obtener customers por userId
  @UseGuards(JwtAuthGuard) // Protegido por JWT
  async findAllByUserId(@Param('userId') userId: string): Promise<InvoiceParty[]> { // Especifica el tipo de retorno
    return this.invoicePartiesService.findAllByUser(userId); // Llama al método del servicio existente
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
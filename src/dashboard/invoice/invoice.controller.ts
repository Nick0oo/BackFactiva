import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards, Req, BadRequestException, Query } from '@nestjs/common'; // Añade BadRequestException y Query
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicePartiesService } from '../invoice_parties/invoice_parties.service'; // Importar el servicio
import { ProductsService } from '../products/products.service'; // Importar el servicio de productos
import { UsersService } from '../../users/users.service'; // Importar el servicio de usuario
import { JwtAuthGuard } from '../../jwt/jwt-auth.guard'; // Importar el guardia de autenticación JWT
import { UnauthorizedException } from '@nestjs/common'; // Importar la excepción de no autorizado
import { Types } from 'mongoose'; // Importar Types de mongoose
import { FactusService } from '../../factus/factus.service'; // Importar el servicio de Factus
import { Invoice, InvoiceDocument } from './entities/invoice.entity'; // Importar la entidad de factura
import { InternalServerErrorException } from '@nestjs/common'; // Importar la excepción de error interno del servidor
import { PaymentMethodCode } from 'src/factus/catalogos/standard-code/catalogs/enum/payment-method-code.enum'; // Importar el enum de PaymentMethodCode

@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly invoicePartiesService: InvoicePartiesService, // Inyectar el servicio
    private readonly userService: UsersService, // Inyectar el servicio de usuario 
    private readonly productsService: ProductsService, // Inyectar el servicio de productos
    private readonly factusService: FactusService, // Inyectar el servicio de Factus
  ) { }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Req() req) {
     const token = req.headers['authorization']?.split(' ')[1];
   
       if (!token) {
         throw new UnauthorizedException('Token no proporcionado');
       }
   
       // Obtener el ID del usuario logueado
       const issuerId = await this.userService.getUserIdFromToken(token);
       if (!issuerId) {
         throw new Error('El emisor es obligatorio')}
      return this.invoiceService.create(createInvoiceDto, issuerId); // Pasa el userId al servicio

  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) { // Asegúrate de que 'id' sea string
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) { // Asegúrate de que 'id' sea string
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) { // Asegúrate de que 'id' sea string
    return this.invoiceService.remove(id);
  }

  @Get('user/:userId') // Ruta para obtener facturas por userId
  @UseGuards(JwtAuthGuard) // Protegido por JWT
  async findAllByUserId(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ invoices: Invoice[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [invoices, total] = await Promise.all([
      this.invoiceService.findAllByUser(userId, skip, limit),
      this.invoiceService.countByUser(userId)
    ]);
    
    return {
      invoices,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // 1) total de facturas de un usuario
  @Get('user/:userId/count')
  @UseGuards(JwtAuthGuard) // Es buena práctica proteger también estos endpoints si contienen info sensible
  countByUser(@Param('userId') userId: string) {
    return this.invoiceService.countByUser(userId);
  }

  // 2) total de facturas por estado y usuario
  @Get('user/:userId/status/:status/count')
  @UseGuards(JwtAuthGuard) // Proteger
  async countByStatusAndUser( // Hacerlo async ya que findByStatusAndUser devuelve Promise
    @Param('userId') userId: string,
    @Param('status') status: string,
  ): Promise<number> { // Especificar tipo de retorno
    const list = await this.invoiceService.findByStatusAndUser(userId, status);
    return list.length;
  }

  @Get('user/:userId/total')
  @UseGuards(JwtAuthGuard) // Proteger
  getTotalPrice(@Param('userId') userId: string) {
    return this.invoiceService.getTotalPrice(userId);
  }
}



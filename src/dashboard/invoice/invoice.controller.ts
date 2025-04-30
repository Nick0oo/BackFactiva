import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicePartiesService } from '../invoice_parties/invoice_parties.service'; // Importar el servicio
import { ProductsService } from '../products/products.service'; // Importar el servicio de productos
import { UsersService } from '../../users/users.service'; // Importar el servicio de usuario
import { JwtAuthGuard } from '../../jwt/jwt-auth.guard'; // Importar el guardia de autenticación JWT
import { UseGuards, Req } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common'; // Importar la excepción de no autorizado

@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly invoicePartiesService: InvoicePartiesService, // Inyectar el servicio
    private readonly userService: UsersService, // Inyectar el servicio de usuario 
    private readonly productsService: ProductsService, // Inyectar el servicio de productos
  ) {}
 

  @Post('create')
  @UseGuards(JwtAuthGuard)  // Aplicar el guard para autenticar al usuario con JWT
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Req() req) {
    // Obtener el token del header de la solicitud
    const token = req.headers['authorization']?.split(' ')[1]; // "Bearer <token>"
    console.log('Token:', token); // Para depuración
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const issuerId = await this.userService.getUserIdFromToken(token); // Usar el servicio para obtener el userId del token

    // Validar si el emisor (issuerId) existe en el DTO
    if (!issuerId) {
      throw new Error('El emisor es obligatorio');
    }

    // Validar receptor
    if (!createInvoiceDto.receiverId || createInvoiceDto.receiverId === '' || createInvoiceDto.items.some(item => item.productId === '')) {
      throw new Error('El receptor es obligatorio');
    }

    const receiverExists = await this.invoicePartiesService.verifyReceiverExists(createInvoiceDto.receiverId);
    if (!receiverExists) {
      throw new Error('El receptor no existe');
    }

    // Verificar los productos
    for (const item of createInvoiceDto.items) {
      const productExists = await this.productsService.verifyProductExists(item.productId);
      if (!productExists) {
        throw new Error(`El producto con ID ${item.productId} no existe`);
      }
    }

    // Crear la factura, pasando el issuerId desde el token
    return this.invoiceService.create({ ...createInvoiceDto, issuerId });
  }

  @Get()
  async findAll() {
    return this.invoiceService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) { // Asegúrate de que 'id' sea string
    return this.invoiceService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) { // Asegúrate de que 'id' sea string
    return this.invoiceService.update(id, updateInvoiceDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) { // Asegúrate de que 'id' sea string
    return this.invoiceService.remove(id);
  }
}



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
import { Types } from 'mongoose'; // Importar Types de mongoose
import { FactusService } from '../../factus/factus.service'; // Importar el servicio de Factus
import { Invoice } from './entities/invoice.entity'; // Importar la entidad de factura

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
  @UseGuards(JwtAuthGuard)  // Protegemos la ruta con el guard de JWT
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Req() req) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    // Obtener el ID del usuario logueado
    const issuerId = await this.userService.getUserIdFromToken(token);
    if (!issuerId) {
      throw new Error('El emisor es obligatorio');
    }

    // Validar el receptor
    if (!createInvoiceDto.receiverId) {
      throw new Error('El receptor es obligatorio');
    }

    // Verificar que el receptor exista
    const receiverId = createInvoiceDto.receiverId as unknown as string;
    const receiverExists = await this.invoicePartiesService.verifyReceiverExists(receiverId);
    if (!receiverExists) {
      throw new Error('El receptor no existe');
    }

    // Validar los productos
    for (const item of createInvoiceDto.items) {
      const productExists = await this.productsService.verifyProductExists(String(item.productId));
      if (!productExists) {
        throw new Error(`El producto con ID ${item.productId} no existe`);
      }
    }

    // Obtener el rango de numeración de Factus
    const numberingRange = await this.factusService.obtenerRangoFacturaDeVenta();
    if (!numberingRange) {
      throw new Error('No se pudo obtener el rango de numeración de Factus');
    }

    // Crear la factura con los datos del DTO y el rango de numeración
    const invoiceData = {
      ...createInvoiceDto,
      issuerId,  // El ID del emisor (usuario logueado)
    };
    const savedInvoice = await this.invoiceService.create(invoiceData);

    // 2. Re-leer la factura CON TODOS LOS DETALLES POBLADOS
    const invoiceWithDetails = await this.invoiceService.findOneWithDetails((savedInvoice._id as string).toString());

  if (invoiceWithDetails.items && invoiceWithDetails.items.length > 0) {
    }
 
    // 3. Validar factura en Factus (pasando el objeto completo)
    const validationResult = await this.factusService.validateInvoice(invoiceWithDetails);

    // 4. Opcional: guardar resultado de validación
    await this.invoiceService.saveValidationResult(savedInvoice._id as Types.ObjectId, validationResult);

    // 5. Devolver respuesta
    return { invoice: invoiceWithDetails, validationResult };
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
  async findAllByUserId(@Param('userId') userId: string): Promise<Invoice[]> { // Especifica el tipo de retorno
    return this.invoiceService.findAllByUser(userId); // Llama al método del servicio existente
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



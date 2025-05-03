import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, UseGuards, Req, BadRequestException } from '@nestjs/common'; // Añade BadRequestException
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

@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly invoicePartiesService: InvoicePartiesService, // Inyectar el servicio
    private readonly userService: UsersService, // Inyectar el servicio de usuario 
    private readonly productsService: ProductsService, // Inyectar el servicio de productos
    private readonly factusService: FactusService, // Inyectar el servicio de Factus
  ) {}

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
      throw new Error('El emisor es obligatorio');
    }

     // Validar el receptor (asegúrate que createInvoiceDto.receiverId sea el ID string)
     if (!createInvoiceDto.receiverId || typeof createInvoiceDto.receiverId !== 'string' || !Types.ObjectId.isValid(createInvoiceDto.receiverId)) {
      throw new BadRequestException('ID de receptor inválido o faltante en el DTO');
    }
    const receiverIdString = createInvoiceDto.receiverId; // Ya es string y validado como ObjectId

    const receiverExists = await this.invoicePartiesService.verifyReceiverExists(receiverIdString);
    if (!receiverExists) {
      throw new BadRequestException(`El receptor con ID ${receiverIdString} no existe`);
    }

    let calculatedTotalAmount = 0; 
    const processedItems = await Promise.all(createInvoiceDto.items.map(async (itemDto) => {
      // Asegúrate que productId en el DTO sea solo el ID (string o ObjectId)
      const productIdString = String(itemDto.productId);
      if (!Types.ObjectId.isValid(productIdString)) {
        throw new BadRequestException(`Formato de ID de producto inválido: ${productIdString}`);
      }

      const product = await this.productsService.findOne(productIdString); // Usar findOne para obtener el producto
      if (!product) {
        throw new BadRequestException(`El producto con ID ${productIdString} no existe`);
      }
      if (typeof product.price !== 'number' || typeof itemDto.quantity !== 'number') {
        throw new BadRequestException(`Precio o cantidad inválidos para el producto ${productIdString}`);
      }

      // --- INICIO CÁLCULO DETALLADO ---
      const quantity = Number(itemDto.quantity);
      const price = Number(product.price);
      const discountRate = itemDto.discount_rate ? Number(itemDto.discount_rate) / 100 : 0; // Convertir a decimal (ej. 10% -> 0.10)

      // Convertir tax_rate string a número decimal
      const taxRateString = itemDto.tax_rate;
      const taxRateNumber = parseFloat(taxRateString);
      if (isNaN(taxRateNumber)) {
          throw new BadRequestException(`Tasa de impuesto inválida '${taxRateString}' para el producto ${productIdString}`);
      }
      const taxRate = taxRateNumber / 100; // Convertir a decimal (ej. 19% -> 0.19)

      // Calcular precio base
      const basePrice = quantity * price;
      // Calcular descuento
      const discountAmount = basePrice * discountRate;
      // Calcular precio después de descuento
      const priceAfterDiscount = basePrice - discountAmount;
      // Calcular impuesto sobre el precio descontado
      const taxAmount = priceAfterDiscount * taxRate;
      // Calcular precio final del item (precio descontado + impuesto)
      const calculatedItemTotalPrice = priceAfterDiscount + taxAmount;
      // --- FIN CÁLCULO DETALLADO ---

      calculatedTotalAmount += calculatedItemTotalPrice; // Sumar al total general

      return {
        ...itemDto,
        productId: new Types.ObjectId(productIdString),
        total_Price: calculatedItemTotalPrice, // Usar el valor final calculado
        quantity: quantity, // Ya es número
        discount_rate: itemDto.discount_rate ? Number(itemDto.discount_rate) : 0, // Guardar el % original si es necesario
        tax_rate: taxRateString, // Guardar el string original si es necesario
        is_excluded: Number(itemDto.is_excluded),
        tribute_id: Number(itemDto.tribute_id),
        // Asegurar que withholding_taxes tenga el formato correcto si existe
        withholding_taxes: itemDto.withholding_taxes?.map(wt => ({
            code: wt.code,
            withholding_tax_rate: Number(wt.withholding_tax_rate)
        })) || []
      };
    }));

    // 4. Crear datos de la factura CON items procesados y totalAmount calculado
    const invoiceData = {
      ...createInvoiceDto,
      issuerId: issuerId.toString(), // Convertir a string
      receiverId: await this.invoicePartiesService.findOne(receiverIdString), // Populate with full receiver details
      items: processedItems,
      totalAmount: calculatedTotalAmount,
      payment_method_code: Number(createInvoiceDto.payment_method_code),
      // Asegúrate que numbering_range_id sea number si es requerido por el schema
      numbering_range_id: createInvoiceDto.numbering_range_id ? Number(createInvoiceDto.numbering_range_id) : 0, // Provide a default value (e.g., 0)
      // Quita otros campos del DTO que no pertenezcan directamente al schema Invoice si es necesario
      notes: createInvoiceDto.notes,
      status: createInvoiceDto.status || 'pending', // Asegurar valor por defecto si es opcional
    };

    // 5. Guardar la factura
    let savedInvoice: InvoiceDocument; // Explicitly typed to ensure _id is recognized
    try {
        savedInvoice = await this.invoiceService.create(invoiceData); // Pasa datos con IDs correctos
    } catch (error) {
        console.error("Error al guardar la factura:", error);
        throw new InternalServerErrorException("No se pudo guardar la factura en la base de datos.");
    }

    // 9. Devolver respuesta (Ahora solo tendrá receiverId poblado)
    return { invoice: savedInvoice };
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



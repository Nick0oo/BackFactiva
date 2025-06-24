import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice } from './entities/invoice.entity';
import { InvoiceDocument } from './entities/invoice.entity';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common'; // Importar excepciones
import { PaymentMethodCode } from 'src/factus/catalogos/standard-code/catalogs/enum/payment-method-code.enum'; // Importar el enum de PaymentMethodCode
import { InvoicePartiesService } from '../invoice_parties/invoice_parties.service'; // Importar el servicio
import { ProductsService } from '../products/products.service'; // Importar el servicio de productos

@Injectable()

export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
    private readonly invoicePartiesService: InvoicePartiesService, // Inyectar el servicio
    private readonly productsService: ProductsService, // Inyectar el servicio de productos
  ) {}
  
  async create(createInvoiceDto: CreateInvoiceDto, issuerId: string): Promise<InvoiceDocument> { 
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

      const basePrice = quantity * price;
      const discountAmount = basePrice * discountRate;
      const priceAfterDiscount = basePrice - discountAmount;
      const taxAmount = priceAfterDiscount * taxRate;
      const calculatedItemTotalPrice = priceAfterDiscount + taxAmount;

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

  // Obtener el valor del payment_method_code 
  const methodInput = createInvoiceDto.payment_method_code; // Puede ser "EFECTIVO" o un código como "10"
  let methodNumber;

// Verificar si es un número o una cadena
if (/^\d+$/.test(methodInput)) {
  // Es un código numérico (como "10")
  methodNumber = Number(methodInput);
  
  // Validar que sea un código válido (opcional)
  const isValidCode = Object.values(PaymentMethodCode).includes(methodNumber);
  if (!isValidCode) {
    throw new BadRequestException(`Código de método de pago inválido: ${methodInput}`);
  }
} else {
  // Es un texto (como "EFECTIVO")
  methodNumber = PaymentMethodCode[methodInput];
  
  // Verificar que se haya convertido correctamente
  if (methodNumber === undefined) {
    throw new BadRequestException(`Método de pago inválido: ${methodInput}`);
  }
}

// Quitar payment_method_code del spread para evitar sobrescribirlo
const { payment_method_code, ...restOfDto } = createInvoiceDto;
  
    const invoiceData = {
      ...restOfDto,
      issuerId: issuerId.toString(), // Convertir a string
      receiverId: receiverIdString, // Usar solo el ID como string, no el objeto completo
      items: processedItems,
      totalAmount: calculatedTotalAmount,
      payment_method_code: methodNumber, // Usar el NÚMERO, no el string
      numbering_range_id: createInvoiceDto.numbering_range_id ? Number(createInvoiceDto.numbering_range_id) : 0, // Provide a default value (e.g., 0)
      notes: createInvoiceDto.notes,
      status: createInvoiceDto.status || 'pending', // Asegurar valor por defecto si es opcional
    };

    // 5. Guardar la factura
    let savedInvoice: InvoiceDocument; // Explicitly typed to ensure _id is recognized
    try {
      const invoice = new this.invoiceModel(invoiceData);
      savedInvoice = await invoice.save();
    } catch (error) {
      console.error("Error al guardar la factura:", error);
      throw new InternalServerErrorException("No se pudo guardar la factura en la base de datos.");
    }
    return savedInvoice;
  }
  

  async saveValidationResult(_id: Types.ObjectId, result: any): Promise<InvoiceDocument> {
    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(_id, { $set: { factusValidation: result } }, { new: true })
      .exec();
    if (!updatedInvoice) {
      throw new NotFoundException(`Invoice with ID ${_id} not found`);
    }
    return updatedInvoice;
  }

  async findAll(): Promise<InvoiceDocument[]> {
    return await this.invoiceModel.find().exec();
  }

  async findOne(_id: string): Promise<InvoiceDocument> {
    const invoice = await this.invoiceModel.findById(_id).populate([]).exec(); // Aquí puedes popular las relaciones si las tienes
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${_id} not found`);
    }
    return invoice;
  }
  async countByUser(_id: string): Promise<number> {
    return this.invoiceModel.countDocuments({ issuerId: _id }).exec();
  }
  
  async update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<InvoiceDocument> {
    const updatedInvoice = await this.invoiceModel.findByIdAndUpdate(
      id,
      updateInvoiceDto,
      { new: true },
    ).exec();
    if (!updatedInvoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    return updatedInvoice;
  }

  async remove(id: string): Promise<void> {
    const result = await this.invoiceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
  }

  async findAllByUser(id: string, skip: number = 0, limit: number = 10): Promise<InvoiceDocument[]> {
    return this.invoiceModel
      .find({ issuerId: id })
      .populate('receiverId', 'names email identification company trade_name address phone')
      .populate({
        path: 'items.productId',
        select: 'name code_reference price unit_measure standard_code_id tribute_id'
      })
      .sort({ issueDate: -1 })
      .select('reference_code totalAmount status issueDate factusInvoiceNumber receiverId items')
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
  }
  // Obtener facturas por estado y usuario
  async findByStatusAndUser(_id: string, status: string): Promise<Invoice[]> {
    return this.invoiceModel.find({ issuerId: _id, status }).exec();
  }
  // Obtener total de recaudado de todas las facturas de un usuario
  async getTotalPrice(userId: string): Promise<number> {
    const invoices = await this.findAllByUser(userId);
    return invoices.reduce((total, invoice) => total + invoice.totalAmount, 0);
  }
  
}
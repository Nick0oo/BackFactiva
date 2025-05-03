import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice } from './entities/invoice.entity';
import { InvoiceDocument } from './entities/invoice.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectModel(Invoice.name) private readonly invoiceModel: Model<InvoiceDocument>,
  ) {}
  
  async create(createInvoiceDto: CreateInvoiceDto): Promise<InvoiceDocument> { 
    const createdInvoice = new this.invoiceModel(createInvoiceDto);
    return await createdInvoice.save();
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

  async findAllByUser(id: string): Promise<InvoiceDocument[]> {
    return this.invoiceModel
      .find({ issuerId: id })
      .populate('receiverId', 'name')    // <— agrega esto
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
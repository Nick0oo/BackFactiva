import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateInvoicePartyDto } from './dto/update-invoice_party.dto';
import { CreateInvoicePartyDto } from './dto/create-invoice_party.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvoiceParty } from './entities/invoice_party.entity';
import { InvoicePartyDocument } from './entities/invoice_party.entity';

@Injectable()
export class InvoicePartiesService {
  constructor(
    @InjectModel(InvoiceParty.name) private readonly invoicePartyModel: Model<InvoicePartyDocument>,
  ) {}

  async create(createInvoicePartyDto: CreateInvoicePartyDto, issuerId): Promise<InvoicePartyDocument> {
    // validar id municipio
   
    const partyData = { ...createInvoicePartyDto, issuerId };
    const createdInvoiceParty = new this.invoicePartyModel(partyData);
    return await createdInvoiceParty.save();
  }


  async findAllByUser(userId: string): Promise<InvoicePartyDocument[]> {
    return this.invoicePartyModel.find({ issuerId: userId }).exec();
  }
  
  async findAll(): Promise<InvoicePartyDocument[]> {
    return await this.invoicePartyModel.find().exec();
  }

  async findOne(id: string): Promise<InvoicePartyDocument> {
    const invoiceParty = await this.invoicePartyModel.findById(id).exec();
    if (!invoiceParty) {
      throw new NotFoundException(`InvoiceParty with ID ${id} not found`);
    }
    return invoiceParty;
  }

  async update(
    id: string,
    updateInvoicePartyDto: UpdateInvoicePartyDto,
  ): Promise<InvoicePartyDocument> {
    const updatedInvoiceParty = await this.invoicePartyModel.findByIdAndUpdate(
      id,
      updateInvoicePartyDto,
      { new: true },
    ).exec();
    if (!updatedInvoiceParty) {
      throw new NotFoundException(`InvoiceParty with ID ${id} not found`);
    }
    return updatedInvoiceParty;
  }

  async remove(id: string): Promise<void> {
    const result = await this.invoicePartyModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`InvoiceParty with ID ${id} not found`);
    }
  }

  async verifyReceiverExists(receiverId: string): Promise<boolean> {
    const invoiceParty = await this.invoicePartyModel.findById(receiverId).exec();
    if (!invoiceParty) {
      throw new NotFoundException(`Receiver with ID ${receiverId} not found`);
    }
    return true;
  }

  
}
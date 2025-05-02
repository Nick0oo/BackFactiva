import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type InvoicePartyDocument = InvoiceParty & Document;

@Schema()
export class InvoiceParty {
  @Prop({ required: true })
  identification: string;

  @Prop()
  dv?: number;

  @Prop()
  company?: string;

  @Prop()
  trade_name?: string;

  @Prop({ required: true })
  names: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  legal_organization_id: number;

  @Prop({ required: true })
  tribute_id: number;

  @Prop({ required: true })
  identification_document_id: number;

  // Este campo proviene de AddressService (folder address)
  @Prop({ required: true })
  municipality_id: number;
}

export const InvoicePartySchema = SchemaFactory.createForClass(InvoiceParty);
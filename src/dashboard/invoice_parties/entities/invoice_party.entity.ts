import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoicePartyDocument = InvoiceParty & Document;

@Schema()
export class InvoiceParty {
  
  @Prop({ required: true, type: 'Mixed' })
  identification_document_id: string | number;
  
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

  @Prop({ required: true, type: 'Mixed' })
  legal_organization_id: string | number;

  @Prop({ required: true, type: 'Mixed' })
  tribute_id: string | number;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true, type: 'Mixed' })
  municipality_id: string | number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  issuerId: Types.ObjectId;
}

export const InvoicePartySchema = SchemaFactory.createForClass(InvoiceParty);
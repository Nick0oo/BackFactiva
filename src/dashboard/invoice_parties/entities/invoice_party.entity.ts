import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoicePartyDocument = InvoiceParty & Document;

@Schema()
export class InvoiceParty {
  
  @Prop({ required: true })
  identification_document_id: number;
  
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
  department: string;

  @Prop({ required: true })
  municipality_id: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true }) // Añade esta línea
  issuerId: Types.ObjectId;
}

export const InvoicePartySchema = SchemaFactory.createForClass(InvoiceParty);
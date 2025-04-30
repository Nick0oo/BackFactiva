import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoicePartyDocument = InvoiceParty & Document;

@Schema()
export class InvoiceParty {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true }) // No siempre requerido, depende de tu lógica
  identificacion: string;

  @Prop({ type: Object }) // Para almacenar la dirección como un objeto
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
  };

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone: string;

}

export const InvoicePartySchema = SchemaFactory.createForClass(InvoiceParty);
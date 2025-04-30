import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
issuerId: Types.ObjectId;


  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: Types.ObjectId;

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
      },
    ],
    _id: false, // Evita que Mongoose genere automáticamente un _id para cada elemento del array
  })
  items: {
    productId: Types.ObjectId;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ required: true })
  tax: number;

  @Prop({ required: true })
  total: number;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  totalAmount: number;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

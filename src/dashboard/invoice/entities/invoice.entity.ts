import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false, timestamps: true })
class InvoiceItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  total_Price: number; // Precio total para esta línea (quantity * price + tax - discount)

  @Prop({ default: 0 })
  discount_rate?: number;

  @Prop({ required: true })
  tax_rate: string; // O number si es un porcentaje fijo

  @Prop({ required: true })
  is_excluded: number; // O boolean

  @Prop({ required: true })
  tribute_id: number;

  @Prop({ type: [{ code: String, withholding_tax_rate: Number }], _id: false, default: [] })
  withholding_taxes?: { code: string; withholding_tax_rate: number }[];

}
export const InvoiceItemSchema = SchemaFactory.createForClass(InvoiceItem);

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class Invoice {
  @Prop()
  reference_code?: string; // Código de referencia de la factura

  @Prop()
  numbering_range_id?: number; // ID del rango de numeración
  
  @Prop()
  payment_method_code: number; // Método de pago de la factura

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  issuerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'InvoiceParty', required: true })
  receiverId: Types.ObjectId;

  @Prop({ type: [InvoiceItemSchema] }) // Usa el schema del subdocumento
  items: InvoiceItem[];

  @Prop({ enum: ['pending', 'completed', 'error'], default: 'pending' })
  status: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  totalAmount: number;

  @Prop()
  factusInvoiceNumber: number; // Número de factura devuelto por Factus

  @Prop({ default: Date.now })
  issueDate: Date; // Fecha de emisión

  @Prop({ type: Object, _id: false }) factusValidation?: any;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

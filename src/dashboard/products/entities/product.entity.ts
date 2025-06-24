import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true })
  code_reference: string; // Código de referencia del producto

  @Prop({ required: true })
  name: string; // Nombre del producto

  @Prop({ required: true })
  price: number; // Precio del producto

  @Prop({ required: true, type: 'Mixed' })
  unit_measure: string | number; // Unidad de medida (ej. "kg", "unidad", etc.)

  @Prop({ required: true, type: 'Mixed' })
  standard_code_id: string | number; // Código estándar del producto

  @Prop({ required: true, type: 'Mixed' })
  tribute_id: string | number; // ID del tributo asociado al producto

  @Prop()
  description?: string; // Descripción opcional del producto

  @Prop({ default: true })
  is_active: boolean; // Indica si el producto está activo o no

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  issuerId: Types.ObjectId; // ID del usuario que creó el producto
}
export const ProductSchema = SchemaFactory.createForClass(Product);
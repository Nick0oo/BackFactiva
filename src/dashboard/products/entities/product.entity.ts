import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true })
  code_reference: string; // Código de referencia del producto

  @Prop({ required: true })
  name: string; // Nombre del producto

  @Prop({ required: true })
  price: number; // Precio del producto

  @Prop({ required: true })
  unit_measure: number; // Unidad de medida (ej. "kg", "unidad", etc.)

  @Prop({ required: true })
  standard_code_id: number; // Código estándar del producto, por ejemplo, un código del producto o servicio

  @Prop({ default: 0 })
  stock_quantity: number; // Cantidad disponible en inventario

  @Prop()
  description?: string; // Descripción opcional del producto

  @Prop({ default: true })
  is_active: boolean; // Indica si el producto está activo o no
}
export const ProductSchema = SchemaFactory.createForClass(Product);
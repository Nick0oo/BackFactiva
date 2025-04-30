import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  price: number;

  @Prop()
  tax: number; // Impuesto aplicado (ej: 0.19 para 19%)

  @Prop()
  unit: string; // Unidad de medida (ej: kg, unidad, etc.)

  // Puedes añadir otros campos específicos de tu entidad Product si son necesarios
}

export const ProductSchema = SchemaFactory.createForClass(Product);
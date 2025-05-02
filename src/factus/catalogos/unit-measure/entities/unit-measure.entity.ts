import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UnitMeasureDocument = UnitMeasure & Document;

@Schema({ collection: 'unit-measure' })
export class UnitMeasure {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;
}

export const UnitMeasureSchema = SchemaFactory.createForClass(UnitMeasure);

  
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { StandardCodeType } from '../standard-code.enum';

@Schema({ timestamps: true })
export class StandardCode {
  @Prop({ required: true, enum: StandardCodeType })
  type: StandardCodeType;

  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  description: string;
}

export type StandardCodeDocument = StandardCode & Document;
export const StandardCodeSchema = SchemaFactory.createForClass(StandardCode);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TributeDocument = Tribute & Document;

@Schema({ collection: 'unit-measure' })
export class Tribute {
  @Prop({ required: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;
}

export const TributeSchema = SchemaFactory.createForClass(Tribute);

  
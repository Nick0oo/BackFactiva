import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;


  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone: string;

  @Prop()
  password?: string; // Manteniendo password si la autenticación local sigue activa
  // Removiendo los campos relacionados con roles
  @Prop()
  provider?: string;
  @Prop()
  hashedRefreshToken?: string;
  @Prop()
  resetTokenExpires?: string;
  @Prop()
  resetPasswordToken?: string;
  @Prop() isMfaEnabled?: boolean;
  @Prop() mfaSecret?: string;
  @Prop()
  tokens?: string;
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Role' }],
    default: [], // por si aún no tienes el ID
  })
  roles?: Types.ObjectId[];
  
}

export const UserSchema = SchemaFactory.createForClass(User);
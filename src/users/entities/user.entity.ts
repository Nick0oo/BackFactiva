import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role } from 'src/users/roles/entities/role.entity';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop()
  password: string;
  @Prop()
  phone: string;
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Role' }] }) // Relación con roles
  roles: Role[];
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
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

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
    @Prop()
    provider?: string; // e.g., 'google'
}

export const UserSchema = SchemaFactory.createForClass(User);
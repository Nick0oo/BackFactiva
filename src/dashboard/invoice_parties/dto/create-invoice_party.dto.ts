// src/auth/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,

} from 'class-validator';

export class CreateInvoicePartyDto {
  @IsNotEmpty() @IsString() identification: string;
  @IsOptional() @IsNumber() dv?: number;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() trade_name?: string;
  @IsNotEmpty() @IsString() names: string;
  @IsNotEmpty() @IsString() address: string;
  @IsNotEmpty() @IsEmail() email: string;
  @IsNotEmpty() @IsString() phone: string;
  @IsNotEmpty() @IsNumber() legal_organization_id: number;
  @IsNotEmpty() @IsNumber() tribute_id: number;
  @IsNotEmpty() @IsNumber() identification_document_id: number;
  @IsNotEmpty() @IsNumber() municipality_id: number;
}


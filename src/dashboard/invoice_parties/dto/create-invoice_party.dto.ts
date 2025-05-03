// src/auth/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateInvoicePartyDto {
  @IsNotEmpty() @IsString() identification: string;
  @IsOptional() @IsNumber() dv?: number;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() trade_name?: string;
  @IsNotEmpty() @IsString() names: string;
  @IsNotEmpty() @IsString() address: string;
  @IsNotEmpty() @IsEmail({}, { message: 'El email debe ser válido' })
  @MinLength(8, { message: 'El email debe tener al menos 8 caracteres' })
  @MaxLength(20, { message: 'El email no debe tener más de 20 caracteres' })
  email: string;
  @Matches(/^3[0-9]{9}$/, {
    message: 'El teléfono debe tener 10 dígitos y comenzar con 3',
  })
  phone: string;
  @IsNotEmpty() @IsNumber() legal_organization_id: number;
  @IsNotEmpty() @IsNumber() tribute_id: number;
  @IsNotEmpty() @IsNumber() identification_document_id: number;
  @IsNotEmpty() @IsNumber() municipality_id: number;
}
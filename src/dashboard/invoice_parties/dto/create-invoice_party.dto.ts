// src/auth/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Matches,
  MinLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CustomerTributeId } from 'src/factus/catalogos/standard-code/catalogs/enum/customer-tribute-id.enum';
import { IdentityDocumentType } from 'src/factus/catalogos/standard-code/catalogs/enum/identity-document-type.enum';
import { OrganizationType } from 'src/factus/catalogos/standard-code/catalogs/enum/organization-type.enum';

export class CreateInvoicePartyDto {
  @IsNotEmpty() @IsString() identification: string;
  @IsOptional() @IsNumber() dv?: number;
  @IsOptional() @IsString() company?: string;
  @IsOptional() @IsString() trade_name?: string;
  @IsNotEmpty() @IsString() names: string;
  @IsNotEmpty() @IsString() address: string;
  @IsNotEmpty() @IsEmail({}, { message: 'El email debe ser válido' })
  @MinLength(8, { message: 'El email debe tener al menos 8 caracteres' })
  email: string;
  @Matches(/^3[0-9]{9}$/, {
    message: 'El teléfono debe tener 10 dígitos y comenzar con 3',
  }) phone: string;
  
  @IsNotEmpty() @Type(() => Number) @IsEnum(OrganizationType) legal_organization_id: OrganizationType;
  @IsNotEmpty() @Type(() => Number) @IsEnum(CustomerTributeId) tribute_id:  CustomerTributeId;
  @IsNotEmpty() @Type(() => Number) @IsEnum(IdentityDocumentType) identification_document_id:  IdentityDocumentType;

  @IsNotEmpty() @IsString() department: string;
  @IsNotEmpty() @IsString() municipality_name: string;
  @IsOptional() municipality_id: string | number;
}
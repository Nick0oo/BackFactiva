// src/dashboard/invoice/dto/create-invoice.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsMongoId, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator'; // Importar IsOptional para usarlo en el DTO

export class InvoiceItemDto {
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;
}

export class CreateInvoiceDto {

  @IsOptional()
@IsMongoId()
issuerId?: string;

  @IsNotEmpty()
  @IsMongoId() // Para la relación con el receptor
  receiverId: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsNotEmpty()
  @IsNumber()
  subtotal: number;

  @IsNotEmpty()
  @IsNumber()
  tax: number;

  @IsNotEmpty()
  @IsNumber()
  total: number;

  @IsString()
  status: string;

  @IsString()
  notes: string;

}
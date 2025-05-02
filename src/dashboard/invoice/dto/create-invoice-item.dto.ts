import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, IsMongoId, } from "class-validator";
import { Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import { WithholdingTaxDto } from "./create-invoice.dto";
import { CreateProductDto } from "../../products/dto/create-product.dto";

export class InvoiceItemDto {
@IsNotEmpty()
  @IsMongoId()
  productId: CreateProductDto; // Receptor
  @IsNotEmpty() @IsNumber() quantity: number;  // Cantidad del producto
  @IsNotEmpty() @IsNumber() total_Price: number;  // Precio total del ítem
  @IsOptional() @IsNumber() discount?: number;  // Descuento aplicado
  @IsOptional() @IsNumber() discount_rate?: number;  // Porcentaje de descuento
  @IsNotEmpty() @IsString() tax_rate: string;  // Tasa de impuestos
  @IsNotEmpty() @IsNumber() is_excluded: number;  // Si está excluido de IVA
  @IsNotEmpty() @IsNumber() tribute_id: number;  // ID del tributo aplicado
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WithholdingTaxDto)
  withholding_taxes?: WithholdingTaxDto[];  // Array de tasas de retención
  }

import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ProductIdentification } from 'src/factus/catalogos/standard-code/catalogs/enum/product-identification.enum';

export class CreateProductDto {
  @IsNotEmpty() @IsString() code_reference: string;  // Código de referencia del producto
  @IsNotEmpty() @IsString() name: string;  // Nombre del producto
  @IsNotEmpty() @IsNumber() price: number;  // Precio base del producto
  @IsNotEmpty() unit_measure: string | number;  // Unidad de medida (como "kg", "unidad", etc.)
  @IsNotEmpty() standard_code_id: string | number;  // Código estándar del producto
  @IsNotEmpty() tribute_id: string | number;  // ID del tributo asociado al producto
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() is_active?: boolean;
}
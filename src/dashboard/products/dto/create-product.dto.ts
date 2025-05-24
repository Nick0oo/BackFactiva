import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { ProductIdentification } from 'src/factus/catalogos/standard-code/catalogs/enum/product-identification.enum';

export class CreateProductDto {
  @IsNotEmpty() @IsString() code_reference: string;  // Código de referencia del producto
  @IsNotEmpty() @IsString() name: string;  // Nombre del producto
  @IsNotEmpty() @IsNumber() price: number;  // Precio base del producto
  @IsNotEmpty() @IsString() unit_measure: number;  // Unidad de medida (como "kg", "unidad", etc.)
  @IsNotEmpty() @IsString() tribute_id: string;  // ID del tributo asociado al producto
  @IsNotEmpty() @IsEnum(ProductIdentification) standard_code_id: keyof typeof ProductIdentification;
}
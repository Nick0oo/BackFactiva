import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty() @IsString() code_reference: string;  // Código de referencia del producto
  @IsNotEmpty() @IsString() name: string;  // Nombre del producto
  @IsNotEmpty() @IsNumber() price: number;  // Precio base del producto
  @IsNotEmpty() @IsNumber() unit_measure: number;  // Unidad de medida (como "kg", "unidad", etc.)
  @IsNotEmpty() @IsNumber() standard_code_id: number;  // Código estándar del producto (puede ser un código de clasificación)
}
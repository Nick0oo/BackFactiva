// src/dashboard/products/dto/create-product.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsNotEmpty()
  @IsNumber()
  tax: number; // Impuesto aplicado (ej: 0.19 para 19%)

  @IsNotEmpty()
  @IsString()
  unit: string; // Unidad de medida (ej: kg, unidad, etc.)

  // Puedes añadir otras propiedades si son necesarias
}
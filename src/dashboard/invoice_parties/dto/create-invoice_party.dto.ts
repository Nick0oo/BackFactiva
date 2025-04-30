// src/auth/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,

} from 'class-validator';


export class AddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  country: string;

}

export class CreateInvoicePartyDto {
  @IsString({ message: 'El tipo de entidad debe ser una cadena de texto' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

 
  @IsString({ message: 'La identificacion debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La identificacion es requerida' })
  identificacion: string;

  @IsNotEmpty({ message: 'La dirección es requerida' })
  address: AddressDto;

  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  phone?: string;


}



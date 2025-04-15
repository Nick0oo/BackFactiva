// src/auth/dto/create-user.dto.ts
import { IsEmail, IsString, Matches , MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  name: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(20, { message: 'La contraseña no debe tener más de 20 caracteres' })
  @Matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      { message: 'La contraseña debe contener al menos un carácter especial' }
    )
  password: string;
}

// src/auth/dto/login.dto.ts
import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'La contraseña debe contener al menos un carácter especial',
  })
  password: string;
}

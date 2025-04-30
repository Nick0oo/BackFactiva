import { IsNotEmpty, IsString } from 'class-validator';


export class CreateRoleDto {

      @IsString({ message: 'El nombre debe ser una cadena de texto' })
      @IsNotEmpty({ message: 'El nombre es requerido' })
      name: string;
    
}


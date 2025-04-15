import { IsString, IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {

    @IsString()
    readonly name: string;
    @IsNotEmpty()
    @IsEmail()
    readonly email: string
    @IsNotEmpty()
    @MinLength(6)
    readonly password: string;
    
    @IsString()
    readonly phone: string;

}

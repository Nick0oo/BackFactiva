import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { StandardCodeType } from '../standard-code.enum';

export class CreateStandardCodeDto {
  @IsEnum(StandardCodeType)
  type: StandardCodeType;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

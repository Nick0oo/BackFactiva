import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsMongoId,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { InvoiceItemDto } from './create-invoice-item.dto';
import { CreateInvoicePartyDto } from '../../invoice_parties/dto/create-invoice_party.dto';
import { PaymentMethodCode } from 'src/factus/catalogos/standard-code/catalogs/enum/payment-method-code.enum';

export class WithholdingTaxDto {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsNumber()
  withholding_tax_rate: number;
}

export class CreateInvoiceDto {
  @IsNotEmpty() @IsNumber() numbering_range_id: number;
  @IsNotEmpty() @IsString() reference_code: string;

  @IsOptional() @IsString() observation?: string;
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string' && !isNaN(Number(value)) && value !== 'ZZZ') {
      return Number(value);
    }
    return value;
  })
  @IsEnum(PaymentMethodCode)
  payment_method_code: PaymentMethodCode | string | number;

  @IsOptional() @IsNumber() totalAmount?: number; // Total de la factura (suma de todos los items)
  
  @IsNotEmpty()
  @IsMongoId()
  receiverId: CreateInvoicePartyDto; // Receptor
  
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @IsOptional() @IsMongoId() issuerId?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsBoolean() isValidated?: boolean;
}

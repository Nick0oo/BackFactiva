import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoicePartyDto } from './create-invoice_party.dto';

export class UpdateInvoicePartyDto extends PartialType(CreateInvoicePartyDto) {}

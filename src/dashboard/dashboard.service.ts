import { Injectable } from '@nestjs/common';
import { InvoiceService } from './invoice/invoice.service';  // Asegúrate de importar InvoiceService
import { InvoiceDocument } from './invoice/entities/invoice.entity';

@Injectable()
export class DashboardService {
  constructor(private readonly invoiceService: InvoiceService) {}

  // Obtener toda la factura por ID
  async findInvoiceById(_id: string): Promise<InvoiceDocument> {
    return this.invoiceService.findOne(_id);
  }


  // Contar todas las facturas
  async getInvoiceCount(): Promise<number> {
    const invoices = await this.invoiceService.findAll();
    return invoices.length;
  }

}

// factus.service.ts
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, firstValueFrom } from 'rxjs'; // Utilizamos lastValueFrom para convertir observables en promesas
import * as qs from 'qs'; // Importamos el módulo qs
import { InvoiceService } from '../dashboard/invoice/invoice.service';

export interface FactusTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope?: string; // opcional, depende si la API lo devuelve
}

export interface PdfResponse {
  pdf: Buffer;
  filename: string;
}

@Injectable()
export class FactusService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    @Inject(forwardRef(() => InvoiceService))
    private invoiceService: InvoiceService,
  ) {
    this.baseUrl = this.configService.get<string>('FACTUS_BASE_URL') ?? 'https://api-sandbox.factus.com.co';
  }

  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null; // timestamp en ms

  private async renovarAccessToken(): Promise<void> {
    const data = qs.stringify({
      grant_type: 'password',
      client_id: this.configService.get('FACTUS_CLIENT_ID'),
      client_secret: this.configService.get('FACTUS_CLIENT_SECRET'),
      username: this.configService.get('FACTUS_USERNAME'),
      password: this.configService.get('FACTUS_PASSWORD'),
      scope: 'numbering:write',
    });

    const url = this.configService.get('FACTUS_TOKEN_URL');

    try {
      const response = await lastValueFrom(
        this.httpService.post<FactusTokenResponse>(url, data, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      );

      if (!response.data.access_token) {
        throw new Error('No se pudo renovar el token de acceso');
      }

      this.accessToken = response.data.access_token;
      this.refreshToken = response.data.refresh_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000; // convierte segundos a milisegundos
    } catch (error) {
      throw new Error('Error al renovar el token de acceso: ' + error.message);
    }
  }

  private async obtenerToken(): Promise<void> {
    const payload = {
      grant_type: 'password',
      client_id: this.configService.get<string>('FACTUS_CLIENT_ID'),
      client_secret: this.configService.get<string>('FACTUS_CLIENT_SECRET'),
      username: this.configService.get<string>('FACTUS_USERNAME'),
      password: this.configService.get<string>('FACTUS_PASSWORD'),
    };

    const url = this.configService.get<string>('FACTUS_TOKEN_URL') ?? (() => { throw new Error('FACTUS_TOKEN_URL is not defined'); })();
    const body = qs.stringify(payload);

    try {
      const resp = await lastValueFrom(
        this.httpService.post<FactusTokenResponse>(url, body, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      this.accessToken = resp.data.access_token;
      this.refreshToken = resp.data.refresh_token;
      this.tokenExpiry = Date.now() + resp.data.expires_in * 1000;
    } catch (error: any) {
      throw new Error('Error al obtener el token de acceso: ' + error.message);
    }
  }
  // Método que retorna token válido, renovando si es necesario
  public async getValidAccessToken(): Promise<string> {
    const now = Date.now();

    // No hay token o expiró
    if (!this.accessToken || !this.tokenExpiry || now >= this.tokenExpiry) {
      if (this.refreshToken) {
        await this.renovarAccessToken();
      } else {
        await this.obtenerToken();
      }
    }

    return this.accessToken!;
  }


  async validateInvoice(invoice: any): Promise<any> {
    try {
      // Verificar que la factura tenga un receptor
      if (!invoice.receiverId) {
        throw new Error('La factura debe tener un receptor');
      }

      // Verificar que la factura tenga items
      if (!invoice.items || invoice.items.length === 0) {
        throw new Error('La factura debe tener al menos un item');
      }

      // Verificar campos requeridos
      const requiredFields = ['reference_code', 'payment_method_code'];
      for (const field of requiredFields) {
        if (!invoice[field]) {
          throw new Error(`El campo ${field} es requerido`);
        }
      }
      // Asegurarnos de que numbering_range_id sea un número
      let numberingRangeId;
      if (typeof invoice.numbering_range_id === 'string') {
        numberingRangeId = parseInt(invoice.numbering_range_id, 10);
      } else {
        numberingRangeId = Number(invoice.numbering_range_id);
      }

      // Verificar si es un número válido
      if (isNaN(numberingRangeId)) {
        numberingRangeId = 8;
      }

      // Transformar los datos al formato esperado por Factus
      const payload = {
        numbering_range_id: numberingRangeId,
        reference_code: invoice.reference_code,
        observation: invoice.notes || '',
        payment_method_code: Number(invoice.payment_method_code),
        customer: {
          identification: invoice.receiverId.identification,
          dv: invoice.receiverId.dv || '',
          company: invoice.receiverId.company || '',
          trade_name: invoice.receiverId.trade_name || '',
          names: invoice.receiverId.names,
          address: invoice.receiverId.address,
          email: invoice.receiverId.email,
          phone: invoice.receiverId.phone,
          legal_organization_id: Number(invoice.receiverId.legal_organization_id),
          tribute_id: Number(invoice.receiverId.tribute_id),
          identification_document_id: Number(invoice.receiverId.identification_document_id),
          municipality_id: invoice.receiverId.municipality_id.toString()
        },
        items: invoice.items.map(i => {
          if (!i.productId) {
            throw new Error('Cada item debe tener un producto asociado');
          }

          // Asegurar que unit_measure y standard_code sean números
          const unitMeasureId = typeof i.productId.unit_measure === 'string' 
            ? Number(i.productId.unit_measure) 
            : i.productId.unit_measure;

          const standardCodeId = typeof i.productId.standard_code_id === 'string'
            ? Number(i.productId.standard_code_id)
            : i.productId.standard_code_id;

          return {
            code_reference: i.productId.code_reference,
            name: i.productId.name,
            quantity: Number(i.quantity),
            price: Number(i.productId.price),
            discount: Number(i.discount_rate || 0),
            discount_rate: Number(i.discount_rate || 0),
            tax_rate: Number(i.tax_rate || 0),
            unit_measure_id: unitMeasureId,
            standard_code_id: standardCodeId,
            is_excluded: Number(i.is_excluded || 0),
            tribute_id: Number(i.productId.tribute_id),
            withholding_taxes: i.withholding_taxes || []
          };
        })
      };

      const token = await this.getValidAccessToken();

      try {
        const response = await lastValueFrom(
          this.httpService.post(
            `${this.baseUrl}/v1/bills/validate`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          ),
        );

        // Verificar si la respuesta tiene datos
        if (!response.data) {
          console.error('Respuesta vacía de Factus');
          throw new Error('La respuesta de Factus está vacía');
        }

        // La respuesta ya contiene la factura validada
        const validatedInvoice = response.data;
        
        // Asegurarnos de que el ID sea un string
        const invoiceId = invoice._id.toString();
        
        // Actualizar la factura con los datos de validación
        const updatedInvoice = await this.invoiceService.updateStatus(invoiceId, 'completed', validatedInvoice);

        return validatedInvoice;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  }

  async downloadInvoicePdf(invoiceId: string): Promise<PdfResponse> {
    // 1. Buscar la factura por _id_
    const invoice = await this.invoiceService.findOne(invoiceId);
    if (!invoice) throw new Error('Factura no encontrada');

    // 2. Extraer el number de Factus
    const factusNumber = invoice.factusValidation?.data?.bill?.number;
    if (!factusNumber) throw new Error('La factura no ha sido validada en Factus. No se puede descargar el PDF.');

    // 3. Usar ese number para pedir el PDF a Factus
    const token = await this.getValidAccessToken();
    const response = await firstValueFrom(
      this.httpService.get(
        `${this.baseUrl}/v1/bills/download-pdf/${factusNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
    );

    // 4. Extraer el base64 y convertirlo a Buffer
    const base64 = response.data.data.pdf_base_64_encoded;
    const filename = response.data.data.file_name + '.pdf';
    const buffer = Buffer.from(base64, 'base64');
    return { pdf: buffer, filename };
  }

  async getNumberingRanges(): Promise<any> {
    try {
      const token = await this.getValidAccessToken();
      const response = await lastValueFrom(
        this.httpService.get(
          `${this.baseUrl}/v1/numbering-ranges`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

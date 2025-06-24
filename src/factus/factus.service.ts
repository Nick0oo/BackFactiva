// factus.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs'; // Utilizamos lastValueFrom para convertir observables en promesas
import * as qs from 'qs'; // Importamos el módulo qs

export interface FactusTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope?: string; // opcional, depende si la API lo devuelve
}

@Injectable()
export class FactusService {
  private readonly baseUrl: string;

  constructor(private readonly httpService: HttpService, private configService: ConfigService) {
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
      console.error('OAuth Error payload:', error.response?.data);
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

  public async generarNumeroFactura(): Promise<number> {
    // Obtener el rango de numeración de la factura de venta
    const rangoFacturaVenta = await this.obtenerRangoFacturaDeVenta();

    // Verificar que el número actual no haya excedido el límite
    if (rangoFacturaVenta.nextNumber >= rangoFacturaVenta.to) {
      throw new Error('Se ha alcanzado el límite máximo de facturas en el rango.');
    }

    // Incrementar el número actual para la próxima factura
    const nuevoNumeroFactura = rangoFacturaVenta.nextNumber;

    // Actualizar el campo 'current' en el rango de numeración
    await this.actualizarRangoNumeroFactura(rangoFacturaVenta.id, nuevoNumeroFactura);

    return nuevoNumeroFactura;
  }

  private async actualizarRangoNumeroFactura(rangoId: number, nuevoNumero: number): Promise<void> {
    const url = `https://api-sandbox.factus.com.co/v1/numbering-ranges/${rangoId}`;
    const headers = {
      Authorization: `Bearer ${await this.getValidAccessToken()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const data = {
      current: nuevoNumero,
    };

    try {
      await lastValueFrom(
        this.httpService.put(url, data, { headers })
      );
    } catch (error) {
      throw new Error('Error al actualizar el número de la factura: ' + error.message);
    }
  }

  async obtenerRangoFacturaDeVenta(): Promise<{ id: number; nextNumber: number; to: number }> {
    const token = await this.getValidAccessToken();
    const resp = await lastValueFrom(
      this.httpService.get(`${this.baseUrl}/v1/numbering-ranges?document=21`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    );

    // 1) Si la API devuelve { data: [...] }
    const list = Array.isArray(resp.data)
      ? resp.data
      : Array.isArray((resp.data as any).data)
        ? (resp.data as any).data
        : [];

    if (!list.length) {
      throw new Error('No se encontró ningún rango de numeración');
    }

    // 2) Si quieres buscar por prefijo:
    const rango = list.find(r => r.prefix === 'FV') ?? list[0];

    return {
      id: rango.id,
      nextNumber: Number(rango.current) + 1,
      to: Number(rango.to), // Ensure 'to' is extracted from the API response
    };
  }

  async validateInvoice(invoice: any): Promise<any> {
    const url = 'https://api-sandbox.factus.com.co/v1/bills/validate';
    const headers = {
      Authorization: `Bearer ${await this.getValidAccessToken()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    console.log(invoice.receiverId.identification);
    interface Invoice {
      numberingRangeId: number;
      referenceCode: string;
      notes?: string;
      paymentMethodCode: string;
      receiverId: ReceiverId;
      items: InvoiceItem[];
    }

    interface ReceiverId {
      identification: string;
      dv: string;
      company: string;
      trade_name: string;
      names: string;
      address: string;
      email: string;
      phone: string;
      legal_organization_id: number;
      tribute_id: number;
      identification_document_id: number;
      municipality_id: number;
    }

    interface InvoiceItem {
      _id: string;
      productId: Product;
      quantity: number;
      discount: number;
      discount_rate: number;
      tax_rate: number;
      is_excluded: boolean;
      tribute_id: number;
      withholding_taxes: any; // Replace `any` with a more specific type if available
    }

    interface Product {
      code_reference: string;
      name: string;
      price: number;
      unit_measure_id: number;
      standard_code_id: number;
    }

    const invoiceData: {
      numbering_range_id: number;
      reference_code: string;
      observation: string;
      payment_method_code: string;
      customer: ReceiverId;
      items: {
        code_reference: string;
        name: string;
        quantity: number;
        price: number;
        discount: number;
        discount_rate: number;
        tax_rate: number;
        unit_measure_id: number;
        standard_code_id: number;
        is_excluded: boolean;
        tribute_id: number;
        withholding_taxes: any; // Replace `any` with a more specific type if available
      }[];
    } = {
      numbering_range_id: invoice.numbering_range_id,
      reference_code: invoice.reference_code,
      observation: invoice.notes || '',
      payment_method_code: invoice.payment_method_code,
      customer: {
        identification: invoice.receiverId.identification,
        dv: invoice.receiverId.dv,
        company: invoice.receiverId.company,
        trade_name: invoice.receiverId.trade_name,
        names: invoice.receiverId.names,
        address: invoice.receiverId.address,
        email: invoice.receiverId.email,
        phone: invoice.receiverId.phone,
        legal_organization_id: invoice.receiverId.legal_organization_id,
        tribute_id: invoice.receiverId.tribute_id,
        identification_document_id: invoice.receiverId.identification_document_id,
        municipality_id: invoice.receiverId.municipality_id,
      },
      items: invoice.items.map(i => {

        if (!i.productId) { // Añade una verificación por si productId no se pobló
          throw new Error(`Producto no encontrado para el item con ID ${i._id}`);
        }

        return {
          code_reference: i.productId.code_reference,
          name: i.productId.name,
          quantity: i.quantity,
          price: i.productId.price,
          discount: i.discount,
          discount_rate: i.discount_rate,
          tax_rate: i.tax_rate,
          unit_measure_id: i.productId.unit_measure,
          standard_code_id: i.productId.standard_code_id,
          is_excluded: i.is_excluded,
          tribute_id: i.tribute_id,
          withholding_taxes: Array.isArray(i.withholding_taxes) ? i.withholding_taxes.filter(wt => wt && wt.code) : [],
        };
      }),
    };

    console.log('Invoice to Validate:', JSON.stringify(invoiceData, null, 2));
    
    const resp = await lastValueFrom(this.httpService.post(url, invoiceData, { headers }));
    return resp.data;
  }

  async sendInvoiceToFactus(invoicePayload: any): Promise<any> {
    const token = await this.getValidAccessToken();

    const url = 'https://api-sandbox.factus.com.co/v1/bills';

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, invoicePayload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data; // Factus devuelve el objeto con datos como factusId, número, etc.
    } catch (error) {
      console.error('Error al enviar la factura a Factus:', error.response?.data || error.message);
      throw new Error('No se pudo enviar la factura a Factus');
    }
  }
}

// factus.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { FactusService } from './factus.service';

@Controller('factus')
export class FactusController {
  constructor(private readonly factusService: FactusService) { }

  @Get('token')
  // Endpoint para obtener el token de acceso
  async obtenerToken(): Promise<{ access_token: string }> {
    const token = await this.factusService.getValidAccessToken();
    return { access_token: token };
  }
  // Endpoint para obtener el rango de numeración de Factus
  @Get('numbering-range')
  async obtenerRangoDeNumeracion(): Promise<any> {
    try {
      const rango = await this.factusService.obtenerRangoFacturaDeVenta();
      return rango;
    } catch (error) {
      throw new Error('Error al obtener el rango de numeración: ' + error.message);
    }
  }

  // Endpoint para validar la factura en Factus
  @Post('validate')
  async validarFactura(@Body() invoiceData: any): Promise<any> {
    try {
      const validationResponse = await this.factusService.validateInvoice(invoiceData);
      return validationResponse;
    } catch (error) {
      throw new Error('Error al validar la factura con Factus: ' + error.message);
    }
  }
}

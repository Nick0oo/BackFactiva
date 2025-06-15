// factus.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, BadRequestException, InternalServerErrorException, HttpException, HttpStatus, Header, Res } from '@nestjs/common';
import { FactusService } from './factus.service';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { InvoiceService } from '../dashboard/invoice/invoice.service';
import { Response } from 'express';

@Controller('factus')
@UseGuards(JwtAuthGuard)
export class FactusController {
  constructor(
    private readonly factusService: FactusService,
    private readonly invoiceService: InvoiceService
  ) { }

  @Get('token')
  // Endpoint para obtener el token de acceso
  async obtenerToken(): Promise<{ success: boolean; data: { access_token: string } }> {
    try {
      const token = await this.factusService.getValidAccessToken();
      return {
        success: true,
        data: { access_token: token }
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el token de acceso: ' + error.message);
    }
  }

  // Endpoint para validar la factura en Factus
  @Post('validate/:id')
  async validateInvoice(@Param('id') id: string): Promise<any> {
    try {
      if (!id) {
        throw new BadRequestException('El ID de la factura es requerido');
      }

      const invoice = await this.invoiceService.findOne(id);
      if (!invoice) {
        throw new BadRequestException(`Factura con ID ${id} no encontrada`);
      }

      const validationResult = await this.factusService.validateInvoice(invoice);
      
      // Actualizar el estado de la factura y guardar la información de Factus
      await this.invoiceService.updateStatus(id, 'completed', validationResult);

      return {
        success: true,
        message: 'Factura validada y enviada exitosamente',
        data: validationResult
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('download-pdf-base64/:id')
  async downloadInvoicePdfBase64(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const response = await this.factusService.downloadInvoicePdf(id);
      
      // Configurar los headers correctamente
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${response.filename}`);
      res.setHeader('Content-Length', response.pdf.length);
      
      // Enviar el buffer directamente
      res.end(Buffer.from(response.pdf));
    } catch (error) {
      console.error('Error en la solicitud:', error);
      throw new HttpException(
        error.message || 'Error al descargar el PDF de la factura',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

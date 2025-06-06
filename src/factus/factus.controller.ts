// factus.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FactusService } from './factus.service';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { InvoiceService } from '../dashboard/invoice/invoice.service';
import { Types } from 'mongoose';

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
  // Endpoint para obtener el rango de numeración de Factus
  @Get('numbering-range')
  async obtenerRangoDeNumeracion(): Promise<any> {
    try {
      const rango = await this.factusService.obtenerRangoFacturaDeVenta();
      return rango;
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el rango de numeración: ' + error.message);
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
      return {
        success: true,
        message: 'Factura validada exitosamente',
        data: validationResult
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('send/:id')
  async sendInvoice(@Param('id') id: string): Promise<any> {
    try {
      if (!id) {
        throw new BadRequestException('El ID de la factura es requerido');
      }

      const invoice = await this.invoiceService.findOne(id);
      if (!invoice) {
        throw new BadRequestException(`Factura con ID ${id} no encontrada`);
      }

      if (!invoice.isValidated) {
        throw new BadRequestException('La factura debe ser validada antes de ser enviada');
      }

      const sendResult = await this.factusService.sendInvoiceToFactus(invoice);
      return {
        success: true,
        message: 'Factura enviada exitosamente',
        data: sendResult
      };
    } catch (error) {
      throw error;
    }
  }
}

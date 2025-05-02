import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard'; // Asegúrate de importar el guardia JWT
import { InvoiceService } from './invoice/invoice.service';  // Asegúrate de importar el servicio de facturas
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { UsersService } from '../users/users.service'; // Asegúrate de importar el servicio de usuarios

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly userService: UsersService, // Inyectar el servicio de usuario
  ) { }
  // Obtener todas las facturas
  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  async getAllInvoices(@Request() req) {
    const userId = req.user._id; // Extrae el ID del usuario desde el JWT

    // Obtener todas las facturas del usuario logueado
    return this.invoiceService.findAllByUser(userId);
  }

  // Obtener el total de facturas
  @Get('invoice/count')
  @UseGuards(JwtAuthGuard)
  async getTotalFacturas(@Request() req) {
    const userId = req.user._id;
    const count = await this.invoiceService.countByUser(userId);
    return { count };
  }
  // Obtener el total recaudado de todas las facturas
  @Get('invoice/total')
  @UseGuards(JwtAuthGuard)
  async getTotalRecaudado(@Request() req) {
    const userId = req.user._id; // Extrae el ID del usuario desde el JWT

    // Obtener todas las facturas del usuario logueado
    const invoices = await this.invoiceService.findAllByUser(userId);
    const total = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    return { totalRecaudado: total };
  }

  // Obtener facturas con estado "emitido"
  @Get('invoice/status/completed')
  @UseGuards(JwtAuthGuard)
  async getEmitidas(@Request() req) {
    const userId = req.user._id; // Extrae el ID del usuario desde el JWT

    // Obtener facturas emitidas por el usuario logueado
    return this.invoiceService.findByStatusAndUser(userId, 'completed');
  }

  // Obtener facturas con estado "no emitido"
  @Get('invoice/status/pending')
  @UseGuards(JwtAuthGuard)
  async getNoEmitidas(@Request() req) {
    const userId = req.user._id; // Extrae el ID del usuario desde el JWT

    // Obtener facturas no emitidas por el usuario logueado
    return this.invoiceService.findByStatusAndUser(userId, 'pending');
  }

  // Obtener toda la factura por ID
  @Get('invoice/:id')
  @UseGuards(JwtAuthGuard)
  async findInvoice(@Param('id') id: string, @Request() req) {
    const invoice = await this.invoiceService.findOne(id); // Ahora busca por el ID de la factura

    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${id} no encontrada`);
    }

    return invoice;
  }
}

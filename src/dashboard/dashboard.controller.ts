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
  ) {}

  // Obtener toda la factura por ID
  @Get('invoice/')
  @UseGuards(JwtAuthGuard)
  async findInvoice( id: string, @Request() req) {
    console.log('ID recibido por parámetro:', id); // ✅ Debug útil
    console.log('ID del usuario autenticado:', req.user._id); // ✅ Debug útil

    const token = req.headers.authorization?.split(' ')[1]; // Extraer el token del encabezado de autorización
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const issuerId = await this.userService.getUserIdFromToken(token); // Usar el servicio para obtener el userId del token

    // Validar si el emisor (issuerId) existe en el DTO
    if (!issuerId) {
      throw new Error('El emisor es obligatorio');
    }

    const invoice = await this.invoiceService.findOne(issuerId);

    if (!invoice) {
      throw new NotFoundException(`Factura con ID ${issuerId} no encontrada`);
    }

    // Verifica que la factura pertenezca al usuario autenticado
    if (invoice.issuerId.toString() !== req.user._id.toString()) {
      throw new UnauthorizedException('No puedes acceder a esta factura');
    }
  return invoice;
}


  // Obtener el total de facturas
  @Get('invoice/count')
  @UseGuards(JwtAuthGuard)
  async getTotalFacturas(@Request() req) {
    const userId = req.user.sub; // Extrae el ID del usuario desde el JWT

    // Obtener todas las facturas del usuario logueado
    const invoices = await this.invoiceService.findAllByUser(userId);
    return { count: invoices.length };
  }

  // Obtener el total recaudado de todas las facturas
  @Get('invoice/total')
  @UseGuards(JwtAuthGuard)
  async getTotalRecaudado(@Request() req) {
    const userId = req.user.sub; // Extrae el ID del usuario desde el JWT

    // Obtener todas las facturas del usuario logueado
    const invoices = await this.invoiceService.findAllByUser(userId);
    const total = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    return { totalRecaudado: total };
  }

  // Obtener facturas con estado "emitido"
  @Get('invoice/status/completed')
  @UseGuards(JwtAuthGuard)
  async getEmitidas(@Request() req) {
    const userId = req.user.sub; // Extrae el ID del usuario desde el JWT

    // Obtener facturas emitidas por el usuario logueado
    return this.invoiceService.findByStatusAndUser('completed');
  }

  // Obtener facturas con estado "no emitido"
  @Get('invoice/status/pending')
  @UseGuards(JwtAuthGuard)
  async getNoEmitidas(@Request() req) {
    const userId = req.user.sub; // Extrae el ID del usuario desde el JWT

    // Obtener facturas no emitidas por el usuario logueado
    return this.invoiceService.findByStatusAndUser('pending');
  }
}

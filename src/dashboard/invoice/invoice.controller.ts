import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, BadRequestException } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../../jwt/jwt-auth.guard';
import { Invoice } from './entities/invoice.entity';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { FactusService } from '../../factus/factus.service';

@Controller('invoice')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly userService: UsersService,
    private readonly factusService: FactusService
  ) { }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Body() createInvoiceDto: CreateInvoiceDto, @Req() req) {
    let code = createInvoiceDto.payment_method_code;
    if (typeof code === 'string' && !isNaN(Number(code)) && code !== 'ZZZ') {
      createInvoiceDto.payment_method_code = Number(code);
    }
    if (!req.user || !req.user._id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    
    const issuerId = req.user._id;
    const invoice = await this.invoiceService.create(createInvoiceDto, issuerId);
    return [invoice];
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const invoices = await this.invoiceService.findAll();
    return invoices || [];
  }

  @Get('needs-validation')
  @UseGuards(JwtAuthGuard)
  async getInvoicesNeedingValidation(@Req() req) {
    if (!req.user || !req.user._id) {
      throw new UnauthorizedException('Usuario no autenticado');
    }
    const invoices = await this.invoiceService.getInvoicesNeedingValidation(req.user._id);
    return invoices || [];
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const invoice = await this.invoiceService.findOne(id);
    return [invoice];
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto) {
    const invoice = await this.invoiceService.update(id, updateInvoiceDto);
    return [invoice];
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    await this.invoiceService.remove(id);
    return [];
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findAllByUserId(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const [invoices, total] = await Promise.all([
      this.invoiceService.findAllByUser(userId, skip, limit),
      this.invoiceService.countByUser(userId)
    ]);
    
    return invoices || [];
  }

  @Get('user/:userId/count')
  @UseGuards(JwtAuthGuard)
  async countByUser(@Param('userId') userId: string) {
    const count = await this.invoiceService.countByUser(userId);
    return [count];
  }

  @Get('user/:userId/status/:status/count')
  @UseGuards(JwtAuthGuard)
  async countByStatusAndUser(
    @Param('userId') userId: string,
    @Param('status') status: string,
  ) {
    const list = await this.invoiceService.findByStatusAndUser(userId, status);
    return [list.length];
  }

  @Get('user/:userId/total')
  @UseGuards(JwtAuthGuard)
  async getTotalPrice(@Param('userId') userId: string) {
    const total = await this.invoiceService.getTotalPrice(userId);
    return [total];
  }

  @Get(':id/validation-status')
  @UseGuards(JwtAuthGuard)
  async getInvoiceValidationStatus(@Param('id') id: string) {
    const status = await this.invoiceService.getInvoiceValidationStatus(id);
    return [status];
  }

  @Post(':id/reset-validation')
  @UseGuards(JwtAuthGuard)
  async resetInvoiceValidation(@Param('id') id: string) {
    const invoice = await this.invoiceService.resetInvoiceValidation(id);
    return [invoice];
  }

  @Post(':id/validate-factus')
  @UseGuards(JwtAuthGuard)
  async validateInvoiceWithFactus(@Param('id') id: string) {
    try {
      const validatedInvoice = await this.invoiceService.validateInvoiceWithFactus(id, this.factusService);
      return [validatedInvoice];
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}



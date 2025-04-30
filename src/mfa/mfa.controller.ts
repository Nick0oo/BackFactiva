import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';

@Controller('mfa')
@UseGuards(JwtAuthGuard)
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Get('qrcode')
  async generateQrCode(@Req() req: any) {
    return this.mfaService.generateQrCode(req.user._id);
  }
}
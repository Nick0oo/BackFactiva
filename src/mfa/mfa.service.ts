import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';

@Injectable()
export class MfaService {
  generateSecret(email: string) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, 'TuApp', secret);
    return { secret, otpauth };
  }

  async generateQrCode(otpauth: string): Promise<string> {
    return await qrcode.toDataURL(otpauth);
  }

  verifyToken(token: string, secret: string): boolean {
    return authenticator.verify({ token, secret });
  }
}
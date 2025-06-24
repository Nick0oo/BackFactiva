import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class MfaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<{ user?: { mfa?: boolean } }>();
    if (req.user?.mfa !== true) {
      throw new UnauthorizedException('Se requiere MFA');
    }
    return true;
  }
}
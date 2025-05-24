import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    const googleConfig = configService.get<{
      clientId: string;
      clientSecret: string;
      callbackUrl: string;
    }>('google'); // Accede a la configuración de Google

    if (!googleConfig) {
      throw new Error('Google configuration is not defined.');
    }

    const clientID = googleConfig.clientId;
    const clientSecret = googleConfig.clientSecret;
    const callbackURL = googleConfig.callbackUrl;

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error(
        'Google OAuth clientID, clientSecret, or callbackUrl is not defined in the configuration.',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['email', 'profile'],
      passReqToCallback: true,
      pkce: false,
    });
  }

  async validate(
    _req: Express.Request,
    accessToken: string,
    _refreshToken: string,
    profile: {
      emails?: { value: string }[];
      displayName?: string;
      provider?: string;
    },
    done: VerifyCallback,
  ): Promise<void> {
    try {
      interface User {
        id: string;
        email: string;
        name: string;
        // Add other properties as needed
      }

      const result = (await this.authService.validateOAuthLogin(profile)) as {
        user: User;
        accessToken: string;
      };
      const { user, accessToken: jwt } = result;
      done(null, { user, jwt });
    } catch (err) {
      done(err, false);
    }
  }
}

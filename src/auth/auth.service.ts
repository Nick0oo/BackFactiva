// src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateOAuthLogin(profile: any): Promise<{ user: any; accessToken: string }> {
    const user = await this.usersService.findOrCreateOAuthUser(profile);

    const payload = { sub: user._id, email: user.email, name: user.name };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1d',
    });

    return { user, accessToken };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
  
    const { password: _, ...result } = user;
    return result;
  }
  

  generateJwt(user: any): string {
    const payload = {
      sub: user._id,
      email: user.email,
      name: user.name,
    };
    return this.jwtService.sign(payload);
  }
  
}

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { Controller, Get, Req, UseGuards, Patch, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Login desde el frontend por OAuth (sin password)
  // Ruta protegida con JWT
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(
    @Req() req: { user: { _id: string; name: string; email: string } },
  ): { _id: string; name: string; email: string } {
    return req.user;
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Patch(':userId/roles/:roleId')
  async assignRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.usersService.assignRole(userId, roleId);
  }
}

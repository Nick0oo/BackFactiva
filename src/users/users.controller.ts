import { UsersService } from './users.service';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { Controller, Get, Req, UseGuards, Patch, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    const userId = req.user._id; // obtén el ID del usuario del token
    return this.usersService.getProfile(userId); // llama a tu nuevo método
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

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';
import { Controller, Get, Req, UseGuards, Patch, Param } from '@nestjs/common';
import { User, UserDocument } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  public async getProfile(
    @Req() req: { user: { _id: string } },
  ): Promise<{ name: string; role: string }> {
    const userId = req.user._id;
    return this.usersService.getProfile(userId);
  }
  @Get()
  public async findAll(): Promise<UserDocument[]> {
    return this.usersService.findAll();
  }

  @Patch(':userId/roles/:roleId')
  public async assignRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ): Promise<User> {
    return this.usersService.assignRole(userId, roleId);
  }
}

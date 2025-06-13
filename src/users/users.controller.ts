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
  ): Promise<UserDocument> {
    const userId = req.user._id;
    return this.usersService.findById(userId);
  }
}

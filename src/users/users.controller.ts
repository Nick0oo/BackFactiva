import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Crear usuario manualmente (opcional)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // Login desde el frontend por OAuth (sin password)
  @Post('login')
  async login(@Body() createUserDto: CreateUserDto) {
    const { email } = createUserDto;
    return this.usersService.findOrCreateOAuthUser(email);
  }
  
  // Ruta protegida con JWT
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req) {
    const { userId } = req.user;
    const user = await this.usersService.findById(userId);
    
    const { password, ...safeUser } = user;
    return safeUser;
  }

@Get()
async findAll() {
  return this.usersService.findAll();
}

}

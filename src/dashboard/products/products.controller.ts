import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../jwt/jwt-auth.guard';
import { Product, ProductDocument } from './entities/product.entity'; 
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly userService: UsersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createProductDto: CreateProductDto, @Req() req) {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    
    const issuerId = await this.userService.getUserIdFromToken(token);
    if (!issuerId) {
      throw new Error('El emisor es obligatorio')
    }
    return this.productsService.create(createProductDto, issuerId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    const products = await this.productsService.findAll();
    return products || [];
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async findAllByUserId(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const skip = (page - 1) * limit;
    const products = await this.productsService.findAllByUser(userId, skip, limit);
    return products || [];
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') _id: string) {
    return await this.productsService.findOne(_id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }
}
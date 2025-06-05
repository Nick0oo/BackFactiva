import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../jwt/jwt-auth.guard'; 
import { Product, ProductDocument } from './entities/product.entity'; 
import { UsersService } from '../../users/users.service'; // Importar el servicio de usuario
import { UnauthorizedException } from '@nestjs/common'; // Importar la excepción de no autorizado

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService
              ,private readonly userService: UsersService, // Inyectar el servicio de usuario
  ) {}


  @Post()
  @UseGuards(JwtAuthGuard) // Protege la ruta
  async create(@Body() createProductDto: CreateProductDto, @Req() req) { // Añade @Req() req
     const token = req.headers['authorization']?.split(' ')[1];
   
       if (!token) {
         throw new UnauthorizedException('Token no proporcionado');
       }
   
       // Obtener el ID del usuario logueado
       const issuerId = await this.userService.getUserIdFromToken(token);
       if (!issuerId) {
         throw new Error('El emisor es obligatorio')}
      return this.productsService.create(createProductDto, issuerId); // Pasa el userId al servicio
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return await this.productsService.findAll();
  }

  @Get('user/:userId') // Ruta para obtener products por userId
  @UseGuards(JwtAuthGuard) // Protegido por JWT
  async findAllByUserId(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ products: Product[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      this.productsService.findAllByUser(userId, skip, limit),
      this.productsService.countByUser(userId)
    ]);
    
    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
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
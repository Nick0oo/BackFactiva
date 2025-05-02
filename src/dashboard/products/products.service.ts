import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './entities/product.entity';
import { ProductDocument } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductDocument> {
    const createdProduct = new this.productModel(createProductDto);
    return await createdProduct.save();
  }

  async findAll(): Promise<ProductDocument[]> {
    return await this.productModel.find().exec();
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      updateProductDto,
      { new: true },
    ).exec();
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  async verifyProductExists(id: string): Promise<boolean> { // <-- Cambiado a string
    // Verifica si el string es un ObjectId válido antes de consultar
    if (!Types.ObjectId.isValid(id)) {
        throw new NotFoundException(`Invalid ID format: ${id}`);
    }
    const product = await this.productModel.findById(id).exec(); // Busca por string ID
    if (!product) {
      // Lanza excepción si no se encuentra
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return true; // Devuelve true si se encuentra
  }
}
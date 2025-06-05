import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product } from './entities/product.entity';
import { ProductDocument } from './entities/product.entity';
import { ProductIdentification } from 'src/factus/catalogos/standard-code/catalogs/enum/product-identification.enum';
import { UnitMeasureService } from 'src/factus/catalogos/unit-measure/unit-measure.service';
import { UnitMeasure } from 'src/factus/catalogos/unit-measure/dto/unit-measure.dto';
import { TributeService } from 'src/factus/catalogos/tribute/tribute.service';
import { Tribute } from 'src/factus/catalogos/tribute/dto/create-tributes.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    private readonly unitMeasureService: UnitMeasureService,
    private readonly tributeService: TributeService,
  ) { }

  private async validateUnitMeasure(unitMeasureCode: string | number): Promise<UnitMeasure> {
    try {
      const unitMeasureCodeStr = unitMeasureCode.toString();
      
      // Primero intentamos buscar por código
      let unitMeasure = await this.unitMeasureService.findByCode(unitMeasureCodeStr);
      
      // Si no se encuentra por código, intentamos buscar por ID
      if (!unitMeasure) {
        unitMeasure = await this.unitMeasureService.findById(unitMeasureCodeStr);
      }
      
      if (!unitMeasure) {
        throw new NotFoundException(`Unidad de medida con código/ID ${unitMeasureCodeStr} no encontrada`);
      }
      return unitMeasure;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al validar la unidad de medida');
    }
  }

  private async validateTribute(tributeId: string | number): Promise<Tribute> {
    try {
      const tributeIdStr = tributeId.toString();
      
      // Primero intentamos buscar por código
      let tribute = await this.tributeService.findByCode(tributeIdStr);
      
      // Si no se encuentra por código, intentamos buscar por ID
      if (!tribute) {
        tribute = await this.tributeService.findById(tributeIdStr);
      }
      
      if (!tribute) {
        throw new NotFoundException(`Tributo con código/ID ${tributeIdStr} no encontrado`);
      }
      return tribute;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al validar el tributo');
    }
  }

  async create(createProductDto: CreateProductDto, issuerId): Promise<ProductDocument> {
    // Buscar la unidad de medida por código
    const unitMeasure = await this.validateUnitMeasure(String(createProductDto.unit_measure));

    // Obtener el ID de la unidad de medida (pueden llamarse diferente según la API)
    const unitMeasureId = unitMeasure.id || unitMeasure.code;

    // Validar el tributo
    const tribute = await this.validateTribute(createProductDto.tribute_id);

    const tributeId = tribute.id || tribute.code;

    // Preparar datos del producto con el ID de la unidad de medida
    const productData = {
      ...createProductDto,
      unit_measure: unitMeasureId, // Guardar el ID en lugar del código
      tribute_id: tributeId, // Guardar el ID del tributo
      issuerId
    };

    const createdProduct = new this.productModel(productData);
    return await createdProduct.save();
  }

  async findAll(): Promise<ProductDocument[]> {
    return await this.productModel.find().exec();
  }

  async findAllByUser(userId: string): Promise<ProductDocument[]> {
    return this.productModel.find({ issuerId: userId }).exec();
  }

  async findOne(id: string): Promise<ProductDocument> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
    const updateData = { ...updateProductDto };

    // Manejar el código de identificación estándar
    if (updateData.standard_code_id) {
      updateData.standard_code_id = ProductIdentification[updateData.standard_code_id] as any;
    }

    // Si se está actualizando la unidad de medida
    if (updateProductDto.unit_measure) {
      const unitMeasure = await this.validateUnitMeasure(String(updateProductDto.unit_measure));

      // Obtener el ID de la unidad de medida
      const unitMeasureId = unitMeasure.id || unitMeasure.code;

      // Actualizar con el ID en vez del código
      updateData.unit_measure = unitMeasureId;
    }

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      updateData,
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

  async verifyProductExists(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`Invalid ID format: ${id}`);
    }
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return true;
  }
}
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
      const unitMeasure = await this.unitMeasureService.findByCode(unitMeasureCodeStr);
      
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
      const tribute = await this.tributeService.findByCode(tributeIdStr);
      
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

  private async enrichProductData(product: ProductDocument) {
    // Obtener datos de la unidad de medida
    const unitMeasure = await this.unitMeasureService.findByCode(product.unit_measure.toString());
    
    // Obtener datos del tributo
    const tribute = await this.tributeService.findByCode(product.tribute_id.toString());

    // Obtener el nombre del código estándar
    const standardCodeName = ProductIdentification[product.standard_code_id] || product.standard_code_id;

    return {
      ...product.toObject(),
      unit_measure: {
        id: product.unit_measure,
        name: unitMeasure?.nombre || 'No encontrado'
      },
      tribute_id: {
        id: product.tribute_id,
        name: tribute?.nombre || 'No encontrado'
      },
      standard_code_id: {
        id: product.standard_code_id,
        name: standardCodeName
      }
    };
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
    const savedProduct = await createdProduct.save();
    return this.enrichProductData(savedProduct);
  }

  async findAll(): Promise<any[]> {
    const products = await this.productModel.find().exec();
    return Promise.all(products.map(product => this.enrichProductData(product)));
  }

  async findAllByUser(userId: string, skip: number = 0, limit: number = 10): Promise<any[]> {
    const products = await this.productModel
      .find({ issuerId: userId })
      .sort({ createdAt: -1 }) // Ordenar por fecha de creación, más reciente primero
      .skip(skip)
      .limit(limit)
      .exec();
    
    return Promise.all(products.map(product => this.enrichProductData(product)));
  }

  async countByUser(userId: string): Promise<number> {
    return this.productModel.countDocuments({ issuerId: userId }).exec();
  }

  async findOne(id: string): Promise<any> {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.enrichProductData(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<any> {
    const updateData = { ...updateProductDto };

    // Si se está actualizando la unidad de medida
    if (updateProductDto.unit_measure) {
      const unitMeasure = await this.validateUnitMeasure(String(updateProductDto.unit_measure));
      updateData.unit_measure = unitMeasure.id || unitMeasure.code;
    }

    // Si se está actualizando el tributo
    if (updateProductDto.tribute_id) {
      const tribute = await this.validateTribute(updateProductDto.tribute_id);
      updateData.tribute_id = tribute.id || tribute.code;
    }

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.enrichProductData(updatedProduct);
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
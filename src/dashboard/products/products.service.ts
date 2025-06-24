import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
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
    if (!unitMeasureCode) {
      throw new BadRequestException('El código de unidad de medida es requerido');
    }

    try {
      const unitMeasureCodeStr = String(unitMeasureCode);
      const unitMeasure = await this.unitMeasureService.findByCode(unitMeasureCodeStr);
      
      if (!unitMeasure) {
        throw new NotFoundException(`Unidad de medida con código/ID ${unitMeasureCodeStr} no encontrada`);
      }
      return unitMeasure;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al validar la unidad de medida');
    }
  }

  private async validateTribute(tributeId: string | number): Promise<Tribute> {
    if (!tributeId) {
      throw new BadRequestException('El ID del tributo es requerido');
    }

    try {
      const tributeIdStr = String(tributeId);
      const tribute = await this.tributeService.findByCode(tributeIdStr);
      
      if (!tribute) {
        throw new NotFoundException(`Tributo con código/ID ${tributeIdStr} no encontrado`);
      }
      return tribute;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al validar el tributo');
    }
  }

  private async enrichProductData(product: ProductDocument) {
    try {
      // Buscar unidad de medida en el catálogo sincronizado (por id o code)
      const unitMeasures = this.unitMeasureService.unitMeasures || [];
      const unitMeasure = unitMeasures.find(
        (u: any) => String(u.id) === String(product.unit_measure) || String(u.code).toUpperCase() === String(product.unit_measure).toUpperCase()
      );
      // Buscar tributo en el catálogo sincronizado (por id o code)
      const tributes = (this.tributeService as any).tributes || [];
      const tribute = tributes.find(
        (t: any) => String(t.id ?? t.code) === String(product.tribute_id)
      );
      // Obtener el nombre del código estándar
      const standardCodeName = ProductIdentification[product.standard_code_id] || product.standard_code_id;
      // Retornar un objeto PLANO, mostrar el code de unidad
      return {
        ...product.toObject(),
        codeReference: product.code_reference,
        unit_measure: {
          id: product.unit_measure,
          code: unitMeasure?.code || String(product.unit_measure),
          name: (unitMeasure as any)?.name || (unitMeasure as any)?.nombre || String(product.unit_measure) || 'No encontrado'
        },
        tribute_id: {
          id: product.tribute_id,
          name: (tribute as any)?.name || (tribute as any)?.nombre || String(product.tribute_id) || 'No encontrado'
        },
        standard_code_id: standardCodeName,
      };
    } catch (error) {
      console.error('Error al enriquecer datos del producto:', error);
      throw new InternalServerErrorException('Error al procesar los datos del producto');
    }
  }

  async create(createProductDto: CreateProductDto, issuerId: string): Promise<ProductDocument> {
    try {
      if (!issuerId) {
        throw new BadRequestException('El ID del emisor es requerido');
      }

      // Buscar la unidad de medida por código
      const unitMeasure = await this.validateUnitMeasure(createProductDto.unit_measure);

      // Obtener el ID de la unidad de medida
      const unitMeasureId = unitMeasure.id || unitMeasure.code;

      // Validar el tributo
      const tribute = await this.validateTribute(createProductDto.tribute_id);
      const tributeId = tribute.id || tribute.code;

      // Preparar datos del producto
      const productData = {
        ...createProductDto,
        unit_measure: unitMeasureId,
        tribute_id: tributeId,
        issuerId
      };

      const createdProduct = new this.productModel(productData);
      const savedProduct = await createdProduct.save();
      return this.enrichProductData(savedProduct);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el producto');
    }
  }

  async findAll(): Promise<any[]> {
    try {
      const products = await this.productModel.find().select('code_reference name price unit_measure standard_code_id tribute_id description is_active issuerId createdAt').exec();
      return Promise.all(products.map(product => this.enrichProductData(product)));
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener los productos');
    }
  }

  async findAllByUser(userId: string, skip: number = 0, limit: number = 10): Promise<any[]> {
    try {
      if (!userId) {
        throw new BadRequestException('El ID del usuario es requerido');
      }

      const products = await this.productModel
        .find({ issuerId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('code_reference name price unit_measure standard_code_id tribute_id description is_active issuerId createdAt')
        .exec();
      
      return Promise.all(products.map(product => this.enrichProductData(product)));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener los productos del usuario');
    }
  }

  async countByUser(userId: string): Promise<number> {
    try {
      if (!userId) {
        throw new BadRequestException('El ID del usuario es requerido');
      }
      return this.productModel.countDocuments({ issuerId: userId }).exec();
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al contar los productos del usuario');
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`ID de producto inválido: ${id}`);
      }

      const product = await this.productModel.findById(id).exec();
      if (!product) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }
      return this.enrichProductData(product);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener el producto');
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`ID de producto inválido: ${id}`);
      }

      const updateData = { ...updateProductDto };

      // Si se está actualizando la unidad de medida
      if (updateProductDto.unit_measure) {
        const unitMeasure = await this.validateUnitMeasure(updateProductDto.unit_measure);
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
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }

      return this.enrichProductData(updatedProduct);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el producto');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`ID de producto inválido: ${id}`);
      }

      const result = await this.productModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el producto');
    }
  }

  async verifyProductExists(id: string): Promise<boolean> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`ID de producto inválido: ${id}`);
      }

      const product = await this.productModel.findById(id).exec();
      if (!product) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado`);
      }
      return true;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al verificar la existencia del producto');
    }
  }
}
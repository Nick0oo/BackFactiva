import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './entities/product.entity';
import { JwtConfigModule } from 'src/jwt/jwt.module';
import { UsersModule } from 'src/users/users.module';
import { UnitMeasureModule } from 'src/factus/catalogos/unit-measure/unit-measure.module';
import { TributeModule } from 'src/factus/catalogos/tribute/tribute.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]), JwtConfigModule, UsersModule, UnitMeasureModule, TributeModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService], 
})
export class ProductsModule {}
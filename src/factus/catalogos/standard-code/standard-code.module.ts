import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StandardCodeService } from './standard-code.service';
import { StandardCodeController } from './standard-code.controller';
import { StandardCode, StandardCodeSchema } from './entities/standard-code.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StandardCode.name, schema: StandardCodeSchema },
    ]),
  ],
  controllers: [StandardCodeController],
  providers: [StandardCodeService],
  exports: [StandardCodeService],
})
export class StandardCodeModule {}

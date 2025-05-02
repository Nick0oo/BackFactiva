import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StandardCode, StandardCodeDocument } from './entities/standard-code.entity';
import { CreateStandardCodeDto } from './dto/create-standard-code.dto';
import { StandardCodeType } from './standard-code.enum';

@Injectable()
export class StandardCodeService {
  constructor(
    @InjectModel(StandardCode.name) private readonly model: Model<StandardCodeDocument>  ) {}

  create(createDto: CreateStandardCodeDto) {
    const created = new this.model(createDto);
    return created.save();
  }

  findAll() {
    return this.model.find().exec();
  }

  findByType(type: StandardCodeType) {
    return this.model.find({ type }).exec();
  }
}

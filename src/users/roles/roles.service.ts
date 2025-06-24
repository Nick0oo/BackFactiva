import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'; 
import { Role } from './entities/role.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { MongoError } from 'mongodb';   
import { RoleDocument } from './entities/role.entity'; // Asegúrate de que esta importación sea correcta


@Injectable()
export class RolesService {

  constructor(@InjectModel('Role') private readonly roleModel: Model<Role>) {}
  // Create a new role 
  async create(createRoleDto: CreateRoleDto) {
    try {

          const rol = new this.roleModel({
            ...createRoleDto,
          });
          
          const savedRole = await rol.save();
        return savedRole; 
        } catch (error) {
          if (error instanceof MongoError && error.code === 11000) {
            throw new HttpException('Rol already exists', HttpStatus.BAD_REQUEST);
          }
          console.error(error);
          throw new HttpException(
            'An error occurred while creating the user. Please try again later.',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
  }

async findById(id: string): Promise<RoleDocument> {
    const rol = await this.roleModel.findById(id).exec();
    
    if (!rol) {
      throw new HttpException('Rol not found', HttpStatus.NOT_FOUND);
    }
    return rol;
  }

  async findAll(): Promise<any[]> {
    return this.roleModel.find().exec();
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}

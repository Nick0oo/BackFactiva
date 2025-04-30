import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MongoError } from 'mongodb';
import { UnauthorizedException } from '@nestjs/common/exceptions/unauthorized.exception';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel('Role') private roleModel: Model<any>, // Replace 'any' with the appropriate RoleDocument type if available
    private readonly jwtService: JwtService, // Inject JwtService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const hashedPassword = await bcrypt.hash(
        (createUserDto.password ?? '').trim(),
        10,
      );
      const userRole = await this.roleModel.findOne({ name: 'user' });

      const user = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        roles: [userRole?._id],
      });
      
      const savedUser = await user.save();
      const { ...userWithoutPassword } = savedUser.toObject();
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
      console.error(error);
      throw new HttpException(
        'An error occurred while creating the user. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOrCreateOAuthUser(profile: {
    emails?: { value: string }[];
    displayName?: string;
    provider?: string;
  }): Promise<Omit<User, 'password'> & { _id: string }> {
    const email =
      profile.emails && profile.emails[0] ? profile.emails[0].value : undefined;
    if (!email) {
      throw new HttpException(
        'Email not found in Google profile',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!profile.displayName) {
      throw new HttpException(
        'Display name not found in OAuth profile',
        HttpStatus.BAD_REQUEST,
      );
    }

    let user: UserDocument | null = await this.userModel
      .findOne({ email })
      .exec();

    if (!user) {
      user = new this.userModel({
        name: profile.displayName,
        email,
        provider: profile.provider,
      });
      await user.save();
    }

    const userWithoutPassword: Omit<User, 'password'> = user.toObject() as Omit<
      User,
      'password'
    >;
    return { ...userWithoutPassword, _id: (user._id as string).toString() };
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    console.log('User found:', id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findAll(): Promise<any[]> {
    return this.userModel.find().exec();
  }

  async updateRefreshToken(userId: string, hashedToken: string | null) {
    return this.userModel.findByIdAndUpdate(userId, {
      hashedRefreshToken: hashedToken,
    });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }
  // user.service.ts

  async saveResetToken(userId: string, token: string, expires: Date) {
    await this.userModel.findByIdAndUpdate(userId, {
      resetPasswordToken: token,
      resetTokenExpires: expires,
    });
  }

  async findResetToken(
    token: string,
  ): Promise<{ token: string; expires: Date } | undefined> {
    const user = await this.userModel
      .findOne({ resetPasswordToken: token })
      .exec();
    if (
      user &&
      user.resetTokenExpires &&
      new Date(user.resetTokenExpires) > new Date()
    ) {
      return {
        token: user.resetPasswordToken ?? '',
        expires: new Date(user.resetTokenExpires),
      };
    }
    return undefined;
  }

  async updatePassword(userId: string, newPassword: string): Promise<User> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    return user.save();
  }

  async deleteResetToken(token: string): Promise<void> {
    await this.userModel
      .updateOne(
        { resetPasswordToken: token },
        { $unset: { resetPasswordToken: '', resetTokenExpires: '' } },
      )
      .exec();
  }

  async clearResetToken(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      resetPasswordToken: null,
      resetTokenExpires: null,
    });
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    // Implement the logic to update the user in the database
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, userData, { new: true })
      .exec();
    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return updatedUser;
  }

  async assignRole(userId: string, roleId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.roles?.some(role => role.toString() === roleId)) {
      const role = await this.roleModel.findById(roleId).exec();
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      if (!user.roles) {
        user.roles = [];
      }
      user.roles.push(role);
    }

    return user.save();
  }
  async findUserWithRoles(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId).populate('roles').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findUserByToken(token: string): Promise<UserDocument | null> {
    try {
        const decoded = this.jwtService.verify(token);
        const userId = decoded.sub;
        return this.findById(userId);
    } catch (error) {
        return null;
    }
}

async getUserIdFromToken(token: string): Promise<string> {
  try {
    console.log('Token:', token); // Log para verificar el token recibido
    const decoded = this.jwtService.verify(token);
    const userId = decoded.sub; // 'sub' es la convención para el ID del usuario en JWT
    return userId;
  } catch (error) {
    throw new UnauthorizedException('Token inválido o expirado');
  }
}

}

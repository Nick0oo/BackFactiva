import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const createdUser = new this.userModel({ ...createUserDto, password: hashedPassword });
      const savedUser = await createdUser.save();
      const { password, ...userWithoutPassword } = savedUser.toObject();
      return userWithoutPassword;
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }
      console.error(error);
      throw new HttpException(
        'An error occurred while creating the user. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

async findOrCreateOAuthUser(profile: any): Promise<Omit<User, 'password'> & { _id: string }> {
  const email = profile.emails?.[0]?.value;
  if (!email) {
    throw new HttpException('Email not found in Google profile', HttpStatus.BAD_REQUEST);
  }

  let user: UserDocument | null = await this.userModel.findOne({ email }).exec();

  if (!user) {
    user = new this.userModel({
      name: profile.displayName,
      email,
      provider: profile.provider,
    });
    await user.save();
  }

  const { password, ...userWithoutPassword } = user.toObject();
  return { ...userWithoutPassword, _id: (user._id as string).toString() };
}

async findById(id: string): Promise<UserDocument> {
  const user = await this.userModel.findById(id).exec();
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


async findResetToken(token: string): Promise<{ token: string; expires: Date } | undefined> {
  const user = await this.userModel.findOne({ resetPasswordToken: token }).exec();
  if (user && user.resetTokenExpires && new Date(user.resetTokenExpires) > new Date()) {
    return { token: user.resetPasswordToken ?? '', expires: new Date(user.resetTokenExpires) };
  }
  return undefined;

}

async updatePassword(userId: string, newPassword: string): Promise<User> {
  const user = await this.userModel.findById(userId).exec();
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  user.password = newPassword;
  return user.save();
}

async deleteResetToken(token: string): Promise<void> {
  await this.userModel.updateOne(
    { resetPasswordToken: token },
    { $unset: { resetPasswordToken: "", resetTokenExpires: "" } }
  ).exec();
}


async clearResetToken(userId: string) {
  await this.userModel.findByIdAndUpdate(userId, {
    resetPasswordToken: null,
    resetTokenExpires: null,
  });
}
  
}

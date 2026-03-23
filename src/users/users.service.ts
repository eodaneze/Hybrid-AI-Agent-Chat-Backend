import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: Role;
  }) {
    const existing = await this.userModel.findOne({ email: data.email });
    if (existing) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userModel.create({
      ...data,
      password: hashedPassword,
      role: data.role || Role.USER,
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async getAvailableAgents() {
    return this.userModel.find({
        role: Role.AGENT,
        isActive: true,
        $expr: {
        $lt: ['$currentActiveCount', '$maxActiveConversations'],
        },
    });
    }
}
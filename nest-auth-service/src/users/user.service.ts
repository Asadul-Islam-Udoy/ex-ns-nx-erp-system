import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findAll() {
    return this.repo.find();
  }

  findByEmail(email: string) {
    return this.repo.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
    });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateUserDto) {
    try {
      const existing = await this.repo.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email already exists');
      // const hashedPassword = await bcrypt.hash(dto.password, 10);
      // console.log('create token', hashedPassword);
      const user = this.repo.create({
        ...dto,
        password: dto.password,
      });

      return this.repo.save(user);
    } catch (error: any) {
      console.error('Error creating user:', error);

      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (!user) return null;
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async delete(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new ConflictException('User is not found!');
    }
    await this.repo.delete(id);
    return { deleted: true };
  }
}

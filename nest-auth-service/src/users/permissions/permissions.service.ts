import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './permission.entity';
@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}
  async create(name: string) {
    const exists = await this.permissionRepo.findOne({ where: { name } });
    if (exists) return exists;
    const perm = this.permissionRepo.create({ name });
    return this.permissionRepo.save(perm);
  }

  async findAll() {
    return this.permissionRepo.find();
  }

  async update(id: number, name: string) {
    const permission = await this.permissionRepo.findOne({ where: { id } });
    if (!permission) throw new NotFoundException('Permission is not found');

    permission.name = name;
    return this.permissionRepo.save(permission);
  }
  async delete(id: number) {
    return this.permissionRepo.delete(id);
  }
}

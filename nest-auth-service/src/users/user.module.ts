// src/users/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { PermissionService } from './permissions/permissions.service';
import { Permission } from './permissions/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Permission])],
  controllers: [UserController],
  providers: [UserService, PermissionService],
  exports: [UserService, PermissionService], // ✅ important — allows AuthModule to use it
})
export class UserModule {}

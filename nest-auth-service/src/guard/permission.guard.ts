import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSION_KEY } from 'src/decoratior/permissions.decorator';
import { UserRole } from 'src/users/user.entity';
export class User {
  id: number;
  name: string;
  role: UserRole;
  permission: { id: number; name: string }[];
}

interface AuthRequest extends Request {
  user: User;
}
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest<AuthRequest>();

    if (!user?.permission) return false;
    const userPermissionNames = user.permission.map((p) => p.name);
    return requiredPermissions.every((perm) =>
      userPermissionNames.includes(perm),
    );
  }
}

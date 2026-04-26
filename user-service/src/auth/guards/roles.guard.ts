import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector }         from '@nestjs/core';
import { ROLES_KEY }         from '../decorators/roles.decorator';
import { Role }              from '../../common/enums/role.enum';
import { AuthenticatedUser } from '../../common/types/jwt.types';

/**
 * Must be used AFTER JwtAuthGuard so request.user is already populated.
 *
 * Usage on a route:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles(Role.SELLER)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    // No @Roles() decorator → route is accessible to any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const user = ctx.switchToHttp().getRequest().user as AuthenticatedUser;

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied. Required role(s): ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
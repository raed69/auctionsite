import { SetMetadata } from '@nestjs/common';
import { Role }        from '../../common/enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Attach required roles to a route handler.
 * Usage: @Roles(Role.SELLER, Role.ADMIN)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
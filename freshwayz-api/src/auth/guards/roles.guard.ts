import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * RolesGuard — reads the @Roles() decorator metadata and compares
 * it against the role embedded in the JWT payload (req.user.role).
 *
 * Must be used AFTER JwtAuthGuard so that req.user is already populated.
 *
 * If no @Roles() is set on the handler, access is granted to any authenticated user.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No @Roles() defined — allow any authenticated user
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: no role found in token');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied: this action requires one of the following roles: [${requiredRoles.join(', ')}]. ` +
        `Your current role is '${user.role}'. Please log in with a registered account to access this feature.`,
      );
    }

    return true;
  }
}

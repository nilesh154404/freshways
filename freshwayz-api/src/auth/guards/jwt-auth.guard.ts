import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard — standard JWT bearer token guard.
 * Apply to any controller or route that requires authentication.
 * Use @Roles(...) decorator alongside this to further restrict by role.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() decorator — marks a route as publicly accessible.
 * When used with a global JwtAuthGuard, this skips the JWT check entirely.
 * Not needed for Option A (per-route guards), but useful for future global guard migration.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

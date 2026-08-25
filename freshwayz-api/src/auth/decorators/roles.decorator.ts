import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * @Roles decorator — specify which roles are allowed to access a route.
 *
 * Usage:
 *   @Roles('Customer')          // Only logged-in customers
 *   @Roles('Customer', 'Guest') // Logged-in customers AND guest token holders
 *   @Roles('Admin', 'Customer') // Admins and customers
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

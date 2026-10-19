import { Permission } from '@/lib/constants/auth.constants';

export type PermissionRequirement = Permission | Permission[];

const normalizeRequirement = (required?: PermissionRequirement): Permission[] => {
  if (!required) {
    return [];
  }

  return Array.isArray(required) ? required : [required];
};

export const hasPermission = (
  userPermissions: Permission[],
  required?: PermissionRequirement,
): boolean => {
  if (!required) {
    return true;
  }

  const requiredPermissions = normalizeRequirement(required);

  if (requiredPermissions.length === 0) {
    return true;
  }

  return requiredPermissions.every((permission) => userPermissions.includes(permission));
};

/** User must have at least one of the listed permissions (OR). */
export const hasAnyPermission = (
  userPermissions: Permission[],
  required: Permission[],
): boolean => {
  if (required.length === 0) {
    return true;
  }

  return required.some((permission) => userPermissions.includes(permission));
};

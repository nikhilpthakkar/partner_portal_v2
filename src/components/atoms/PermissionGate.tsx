'use client';

import type { ReactNode } from 'react';
import type { Permission } from '@/lib/constants/auth.constants';
import { usePartnerStore } from '@/lib/store/partner.store';
import {
  hasAnyPermission,
  hasPermission,
  PermissionRequirement,
} from '@/lib/utils/permissionUtils';

type PermissionGateProps = {
  /** User must have all of these (single permission, or AND when array). */
  permission?: PermissionRequirement;
  /** User must have at least one of these (OR). Ignored when empty/undefined. */
  anyOf?: Permission[];
  children: ReactNode;
};

export function PermissionGate({ permission, anyOf, children }: PermissionGateProps) {
  const permissions = usePartnerStore((state) => state.permissions);

  const allowedAll = hasPermission(permissions, permission);
  const allowedAny = !anyOf?.length || hasAnyPermission(permissions, anyOf);

  if (allowedAll && allowedAny) {
    return children;
  }

  return null;
}

'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { FallbackState } from '@/components/templates/FallbackState';
import { ACCESS_DENIED_MESSAGE } from '@/lib/constants/auth.constants';
import { getDashboardRoutePermission } from '@/lib/constants/routePermissions.constants';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { usePartnerStore } from '@/lib/store/partner.store';
import { hasPermission } from '@/lib/utils/permissionUtils';

type DashboardRouteGuardProps = {
  children: ReactNode;
};

export function DashboardRouteGuard({ children }: DashboardRouteGuardProps) {
  const pathname = usePathname();
  const permissions = usePartnerStore((state) => state.permissions);
  const { permissionsResolved } = usePartnerConfigReady();
  const requiredPermission = getDashboardRoutePermission(pathname);

  if (!permissionsResolved) {
    return null;
  }

  if (!hasPermission(permissions, requiredPermission) && permissionsResolved) {
    return <FallbackState message={ACCESS_DENIED_MESSAGE} />;
  }

  return children;
}

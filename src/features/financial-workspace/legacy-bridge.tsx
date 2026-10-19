'use client';
import { useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePartnerStore } from '@/lib/store/partner.store';
import { PERMISSIONS } from '@/lib/constants/auth.constants';
import { useFinancialWorkspace } from './provider';
import { setLegacyContext } from './legacy-context';
export function LegacyBridge({ children }: { children: ReactNode }) {
  const { snapshot, view, role } = useFinancialWorkspace();
  const client = useQueryClient();
  useEffect(() => {
    setLegacyContext({ snapshot, view });
    const operational = view.actor.planIds.length > 0;
    const permissions = [
      PERMISSIONS.VIEW_DASHBOARD,
      PERMISSIONS.CONFIGURE_METRICS,
      ...(operational
        ? [PERMISSIONS.VIEW_POLICIES, PERMISSIONS.VIEW_CLAIMS, PERMISSIONS.VIEW_REPORTS]
        : []),
      ...(view.actor.capabilities.includes('view') ? [PERMISSIONS.VIEW_FINANCIALS] : []),
    ];
    usePartnerStore.setState({
      partnerId: 'zomato_driver_renewed',
      lob: 'health',
      productIds: operational ? ['group_health'] : [],
      permissions,
      partnerOptions: [{ value: 'zomato_driver_renewed', label: 'Sample operational records' }],
      productOptions: [{ value: 'group_health', label: 'Sample Group Health' }],
      lobOptions: [{ value: 'health', label: 'Health' }],
    });
    void client.invalidateQueries();
    // Finance snapshot is the shared source for legacy overview financial metrics.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    snapshot.revision,
    snapshot.topology,
    snapshot.dataState,
    snapshot.reconciliation,
    role,
    client,
  ]);
  return children;
}

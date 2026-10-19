'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { DashboardRouteGuard } from '@/components/organisms/DashboardRouteGuard';
import { Sidebar } from '@/components/organisms/MainSidebar';
import { ContentWrapper } from '@/components/templates/DashboardContentWrapper';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { useDataSourceUrlState } from '@/lib/hooks/useDataSourceUrlState';
import { useUserProfileQuery } from '@/lib/query/userProfile.queries';
import { usePartnerStore } from '@/lib/store/partner.store';
import { useUserProfileStore } from '@/lib/store/userProfile.store';
import { DatadogPageRenderTracker } from '@/components/datadog/DatadogPageRenderTracker';
import { cn } from '@/lib/utils';
import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';
import { FinancialWorkspaceProvider } from '@/features/financial-workspace/provider';
import { LegacyBridge } from '@/features/financial-workspace/legacy-bridge';
import { FinancialSimulatorShell } from '@/features/financial-workspace/shell';

type LayoutWrapperProps = {
  children: ReactNode;
};

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  if (FINANCIAL_SIMULATOR_ENABLED)
    return (
      <FinancialWorkspaceProvider>
        <LegacyBridge>
          <FinancialSimulatorShell>{children}</FinancialSimulatorShell>
        </LegacyBridge>
      </FinancialWorkspaceProvider>
    );
  return <LiveLayoutWrapper>{children}</LiveLayoutWrapper>;
}

function LiveLayoutWrapper({ children }: LayoutWrapperProps) {
  const { partner } = useParams<{ partner: string }>();
  const { partnerId, setPartnerId } = usePartnerStore();
  const { isReady } = usePartnerConfigReady();
  const { data: userProfile, isLoading: isUserProfileLoading } = useUserProfileQuery({
    enabled: isReady,
  });
  const { setUserProfile, setIsLoading } = useUserProfileStore();

  useDataSourceUrlState();

  useEffect(() => {
    if (partner && partner !== partnerId) {
      setPartnerId(partner);
    }
  }, [partner, partnerId, setPartnerId]);

  useEffect(() => {
    setIsLoading(!isReady || isUserProfileLoading);
  }, [isReady, isUserProfileLoading, setIsLoading]);

  useEffect(() => {
    if (!userProfile) {
      return;
    }

    setUserProfile(userProfile);
  }, [userProfile, setUserProfile]);

  return (
    <div className={cn('bg-background text-foreground flex h-screen overflow-hidden')}>
      <Sidebar />
      <ContentWrapper>
        <DashboardRouteGuard>
          <DatadogPageRenderTracker>{children}</DatadogPageRenderTracker>
        </DashboardRouteGuard>
      </ContentWrapper>
    </div>
  );
}

'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLoginUrl } from '@/lib/utils/environment';
import { usePartnerConfig } from '@/lib/hooks/usePartnerConfig';
import { GLOBAL_LOADER_MESSAGES } from '@/lib/constants/auth.constants';
import { useGlobalLoaderStore } from '@/lib/store/globalLoader.store';
import { Loader } from 'lucide-react';
import { FallbackState } from '@/components/templates/FallbackState';
import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';
import { FinancialSimulatorEntry } from '@/features/financial-workspace/entry';

export default function HomePage() {
  return FINANCIAL_SIMULATOR_ENABLED ? <FinancialSimulatorEntry /> : <LiveHomePage />;
}

function LiveHomePage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { isPermissionsLoading, permissionsIsReady, partnerId, hasNoData, hasError } =
    usePartnerConfig();
  const { showLoader, hideLoader } = useGlobalLoaderStore();
  const router = useRouter();

  useEffect(() => {
    if (!isPermissionsLoading && permissionsIsReady && partnerId) {
      router.push(`/${partnerId}/dashboard/overview`);
    }
  }, [permissionsIsReady, isPermissionsLoading, router, partnerId]);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      showLoader(GLOBAL_LOADER_MESSAGES.LOGIN_REDIRECT_LOADING);
      setTimeout(() => {
        hideLoader();
        window.location.href = getLoginUrl();
      }, 2000);
    }
  }, [isAuthenticated, isAuthLoading]);

  if (isAuthenticated && !isAuthLoading && !isPermissionsLoading && (hasNoData || hasError)) {
    return <FallbackState message={GLOBAL_LOADER_MESSAGES.TROUBLE_LOADING_STATUS} />;
  }

  return (
    <div className="fixed inset-0 z-[9999] p-6 bg-white/80 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center">
        <Loader className="size-8 text-primary animate-[spin_2s_linear_infinite]" />
      </div>
    </div>
  );
}

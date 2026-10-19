'use client';

import { GLOBAL_LOADER_MESSAGES } from '@/lib/constants/auth.constants';
import { useAuth } from '@/lib/context/AuthContext';
import { useGlobalLoaderStore } from '@/lib/store/globalLoader.store';
import { getLoginUrl } from '@/lib/utils/environment';
import { useEffect } from 'react';
import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';
import { FinancialSimulatorEntry } from '@/features/financial-workspace/entry';

export default function LogoutPage() {
  return FINANCIAL_SIMULATOR_ENABLED ? <FinancialSimulatorEntry /> : <LiveLogoutPage />;
}

function LiveLogoutPage() {
  const { logout } = useAuth();
  const { showLoader, hideLoader } = useGlobalLoaderStore();

  useEffect(() => {
    logout();
    showLoader(GLOBAL_LOADER_MESSAGES.LOGOUT_REDIRECT_LOADING);

    const timeout = setTimeout(() => {
      hideLoader();
      window.location.href = getLoginUrl();
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [logout, showLoader, hideLoader]);

  return null;
}

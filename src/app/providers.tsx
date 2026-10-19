'use client';

import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, isAxiosError, isCancel } from 'axios';
import { ReactNode, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AuthProvider } from '@/lib/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import { GlobalLoader } from '@/components/templates/GlobalLoader';
import { ACCESS_DENIED_MESSAGE } from '@/lib/constants/auth.constants';
import { removeUserIdCookie } from '@/lib/utils/auth';
import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';

const ACCESS_DENIED_TOAST_ID = 'access-denied';

type AccessDeniedErrorResponse = {
  title?: string;
  message?: string;
};

export default function Providers({ children }: { children: ReactNode }) {
  if (FINANCIAL_SIMULATOR_ENABLED)
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  return <LiveProviders>{children}</LiveProviders>;
}

function LiveProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    removeUserIdCookie();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error, query) => {
            const axiosError = error as AxiosError<AccessDeniedErrorResponse>;
            if (axiosError.response?.status !== 403) {
              return;
            }

            const failureCount = query.state.fetchFailureCount;
            const retryOption = query.options.retry;

            let isFinalAttempt = false;
            if (typeof retryOption === 'function') {
              isFinalAttempt = !retryOption(failureCount, error);
            } else if (retryOption === true) {
              isFinalAttempt = false;
            } else {
              const retryCount = typeof retryOption === 'number' ? retryOption : 0;
              isFinalAttempt = failureCount > retryCount;
            }

            if (!isFinalAttempt) {
              return;
            }

            const errorData = axiosError.response.data;
            toast.error(errorData?.title ?? 'Access Denied', {
              id: ACCESS_DENIED_TOAST_ID,
              description: errorData?.message ?? ACCESS_DENIED_MESSAGE,
            });
          },
        }),
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (isCancel(error)) {
                return false;
              }

              if (isAxiosError(error)) {
                const status = error.response?.status;
                if (status && status >= 500) {
                  return failureCount < 2;
                }

                return false;
              }

              return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            staleTime: 0,
            retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 30000),
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster />
        <GlobalLoader />
      </AuthProvider>
    </QueryClientProvider>
  );
}

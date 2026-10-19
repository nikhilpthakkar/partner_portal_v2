'use client';

import { Loader } from 'lucide-react';
import { useGlobalLoaderStore } from '@/lib/store/globalLoader.store';
import { AppImage } from '../atoms/AppImage';

export function GlobalLoader() {
  const isLoading = useGlobalLoaderStore((state) => state.isLoading);
  const message = useGlobalLoaderStore((state) => state.message);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] p-6 bg-white/90 backdrop-blur-sm">
      <AppImage
        src="/images/acko-enterprise-logo.svg"
        alt="ACKO Enterprise"
        width={166}
        height={40}
      />
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="size-8 text-primary animate-[spin_2s_linear_infinite]" />
          {message && <p className="text-xl pt-8 text-center">{message}</p>}
        </div>
      </div>
    </div>
  );
}

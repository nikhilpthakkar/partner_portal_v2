'use client';

import { InfoIcon } from 'lucide-react';
import { AppImage } from '../atoms/AppImage';

export function FallbackState({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[9999] p-6 bg-white/80 backdrop-blur-sm">
      <AppImage
        src="/images/acko-enterprise-logo.svg"
        alt="ACKO Enterprise"
        width={166}
        height={40}
      />
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <InfoIcon className="size-8" />
          <p className="text-xl pt-8 text-center">{message}</p>
        </div>
      </div>
    </div>
  );
}

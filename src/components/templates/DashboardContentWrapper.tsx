'use client';

import type { ReactNode } from 'react';
import { HeaderBar } from '@/components/organisms/HeaderBar';

type ContentWrapperProps = {
  children: ReactNode;
};

export function ContentWrapper({ children }: ContentWrapperProps) {
  return (
    <div className="h-[98vh] overflow-hidden m-2 w-full rounded-xl bg-card text-foreground shadow-md flex flex-col">
      <HeaderBar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

import type { ReactNode } from 'react';

import { LayoutWrapper } from '@/components/templates/DashboardLayout';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <LayoutWrapper>{children}</LayoutWrapper>;
}

'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { DatadogComponentRenderTracker } from '@/components/datadog/DatadogComponentRenderTracker';

type DatadogPageRenderTrackerProps = {
  children: ReactNode;
  name?: string;
};

/**
 * Tracks full page subtree render performance using the current route path.
 */
export function DatadogPageRenderTracker({ children, name }: DatadogPageRenderTrackerProps) {
  const pathname = usePathname();
  const vitalName = name ?? pathname ?? 'unknown_page';

  return <DatadogComponentRenderTracker name={vitalName}>{children}</DatadogComponentRenderTracker>;
}

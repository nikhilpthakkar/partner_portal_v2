'use client';

import { UNSTABLE_ReactComponentTracker } from '@datadog/browser-rum-react';
import type { ReactNode } from 'react';

type DatadogComponentRenderTrackerProps = {
  /** Stable component name shown in Datadog RUM vitals (`reactComponentRender`). */
  name: string;
  children?: ReactNode;
};

const isComponentRenderTrackingEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_DD_COMPONENT_RENDER_TRACKING !== 'false';

/**
 * Reports React render + effect + layout-effect duration to Datadog as a duration vital.
 * Requires `reactPlugin()` in `initDatadogRum()`.
 */
export function DatadogComponentRenderTracker({
  name,
  children,
}: DatadogComponentRenderTrackerProps) {
  if (!isComponentRenderTrackingEnabled()) {
    return children;
  }

  return <UNSTABLE_ReactComponentTracker name={name}>{children}</UNSTABLE_ReactComponentTracker>;
}

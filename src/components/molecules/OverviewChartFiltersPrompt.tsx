import { InfoIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  CHART_HEIGHT,
  OVERVIEW_CHART_FILTERS_REQUIRED_MESSAGE,
} from '@/lib/constants/overview.constants';
import ErrorCard from './ErrorCard';

type OverviewChartFiltersPromptProps = {
  className?: string;
  height?: number;
};

export default function OverviewChartFiltersPrompt({
  className,
  height = CHART_HEIGHT,
}: OverviewChartFiltersPromptProps) {
  return (
    <div
      className={cn('flex w-full items-center justify-center', className)}
      style={{ minHeight: height }}
    >
      <ErrorCard
        icon={<InfoIcon className="size-6" />}
        title={OVERVIEW_CHART_FILTERS_REQUIRED_MESSAGE}
        className="border-none"
      />
    </div>
  );
}

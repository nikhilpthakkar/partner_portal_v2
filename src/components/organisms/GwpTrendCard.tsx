'use client';

import { useEffect, useMemo, useState } from 'react';
import GWPTrendBar from '@/components/atoms/GWPTrendBar';
import ChartGroupBySelect from '@/components/molecules/ChartGroupBySelect';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import InfoTooltip from '../molecules/InfoTooltip';
import GraphCardSkelton from '@/components/molecules/skeltons/GraphCardSkelton';
import {
  BAR_WIDTH,
  BORDER_RADIUS,
  CHART_HEIGHT,
  DEFAULT_CHART_GROUP_BY,
  PAGE_SIZE,
  SHOW_Y_AXIS_LABEL,
} from '@/lib/constants/overview.constants';
import ErrorCard from '../molecules/ErrorCard';
import OverviewChartFiltersPrompt from '../molecules/OverviewChartFiltersPrompt';
import { ChevronLeft, ChevronRight, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGwpTrendQuery } from '@/lib/query/overview.queries';
import { mapGwpChartComponentToCard } from '@/lib/adapter/overview/gwpTrend.adapter';
import { useOverviewStore } from '@/lib/store/overview.store';
import { isOverviewChartDateRangeSelected } from '@/lib/utils/overview/overviewChart.utils';
import type { GroupBy } from '@/lib/types/overview';

type GwpTrendCardProps = {
  enabled?: boolean;
  className?: string;
};

export default function GwpTrendCard({ enabled = true, className }: GwpTrendCardProps) {
  const { dateRange } = useOverviewStore();
  const isDateRangeSelected = isOverviewChartDateRangeSelected(dateRange);
  const [groupBy, setGroupBy] = useState<GroupBy>(DEFAULT_CHART_GROUP_BY);
  const [startIndex, setStartIndex] = useState(0);

  const { data, isLoading, isError } = useGwpTrendQuery(enabled && isDateRangeSelected, groupBy);
  const gwpTrendData = useMemo(() => mapGwpChartComponentToCard(data), [data]);
  const { title, categories, periodStarts, periodEnds, totalGwp, policyCount, infoText, hasData } =
    gwpTrendData;

  useEffect(() => {
    setStartIndex(0);
  }, [categories, dateRange, groupBy]);

  const visibleCategories = useMemo(
    () => categories.slice(startIndex, startIndex + PAGE_SIZE),
    [categories, startIndex],
  );

  const visibleGwp = useMemo(
    () => totalGwp.slice(startIndex, startIndex + PAGE_SIZE),
    [totalGwp, startIndex],
  );

  const visiblePolicyCount = useMemo(
    () => policyCount.slice(startIndex, startIndex + PAGE_SIZE),
    [policyCount, startIndex],
  );

  const handlePrevious = () => {
    setStartIndex((prev) => Math.max(prev - PAGE_SIZE, 0));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(prev + PAGE_SIZE, categories.length - PAGE_SIZE));
  };

  const previousDisabled = startIndex === 0;
  const nextDisabled = startIndex + PAGE_SIZE >= categories.length;

  if (isError) {
    return <ErrorCard title="Unable to load gwp trend" description="Please try again later." />;
  }

  return (
    <Card
      className={cn(
        'rounded-gwp-trend-card border-gwp-trend-border flex flex-col p-4 pb-0',
        className,
      )}
    >
      {isLoading && isDateRangeSelected ? (
        <GraphCardSkelton chartHeight={CHART_HEIGHT} />
      ) : (
        <div className="flex h-full flex-col gap-2">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <p className="text-gwp-trend-title text-base leading-6">{title}</p>
              {infoText && (
                <InfoTooltip
                  infoText={infoText}
                  iconClassName="text-gwp-trend-icon h-4 w-4"
                  arrowClassName="fill-gwp-trend-tooltip"
                  className="bg-gwp-trend-tooltip text-gwp-trend-tooltip-text rounded-gwp-trend-tooltip"
                />
              )}
            </div>
            <ChartGroupBySelect value={groupBy} onValueChange={setGroupBy} />
          </div>
          <div className="relative flex h-full w-full items-center justify-space-between">
            {!isDateRangeSelected ? (
              <OverviewChartFiltersPrompt />
            ) : hasData ? (
              <>
                {categories.length > PAGE_SIZE && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={previousDisabled}
                    aria-label="Previous period"
                    className="bg-pagination-background hover:bg-avatar-background"
                  >
                    <ChevronLeft className="!h-5 !w-5" />
                  </Button>
                )}
                <GWPTrendBar
                  categories={visibleCategories}
                  totalGWP={visibleGwp}
                  height={CHART_HEIGHT}
                  barWidth={BAR_WIDTH}
                  borderRadius={BORDER_RADIUS}
                  showYAxisLabel={SHOW_Y_AXIS_LABEL}
                  policyCount={visiblePolicyCount}
                  showLegend
                />
                {categories.length > PAGE_SIZE && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={nextDisabled}
                    aria-label="Next period"
                    className="bg-pagination-background hover:bg-avatar-background"
                  >
                    <ChevronRight className="!h-5 !w-5" />
                  </Button>
                )}
              </>
            ) : (
              <ErrorCard
                icon={<CircleAlert className="size-6" />}
                title="No data available"
                className="border-none"
              />
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

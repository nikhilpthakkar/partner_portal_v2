'use client';

import { useEffect, useMemo, useState } from 'react';
import GeoDistributionBar from '@/components/atoms/GeoDistributionBar';
import ChartGroupBySelect from '@/components/molecules/ChartGroupBySelect';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import InfoTooltip from '../molecules/InfoTooltip';
import GraphCardSkelton from '@/components/molecules/skeltons/GraphCardSkelton';
import ErrorCard from '../molecules/ErrorCard';
import OverviewChartFiltersPrompt from '../molecules/OverviewChartFiltersPrompt';
import { ChevronLeft, ChevronRight, CircleAlert } from 'lucide-react';
import { TENURE_DISTRIBUTION_BAR_WIDTH } from '@/lib/constants/tenureDistribution.constants';
import {
  OVERVIEW_CHART_INFO_TOOLTIP_ARROW,
  OVERVIEW_CHART_INFO_TOOLTIP_CLASS,
  OVERVIEW_CHART_INFO_TOOLTIP_ICON,
} from '@/lib/utils/overview/chartTooltip.utils';
import { CHART_HEIGHT, DEFAULT_CHART_GROUP_BY, PAGE_SIZE, periodicGroupByOptions, SHOW_Y_AXIS_LABEL } from '@/lib/constants/overview.constants';
import { useTenureDistributionQuery } from '@/lib/query/overview.queries';
import { mapTenureDistributionChartComponentToCard } from '@/lib/adapter/overview/tenureDistribution.adapter';
import { useOverviewStore } from '@/lib/store/overview.store';
import { isOverviewChartDateRangeSelected } from '@/lib/utils/overview/overviewChart.utils';
import type { GroupBy } from '@/lib/types/overview';

type TenureDistributionCardProps = {
  enabled?: boolean;
  className?: string;
};

export default function TenureDistributionCard({
  enabled = true,
  className,
}: TenureDistributionCardProps) {
  const { dateRange } = useOverviewStore();
  const isDateRangeSelected = isOverviewChartDateRangeSelected(dateRange);
  const [groupBy, setGroupBy] = useState<GroupBy>(DEFAULT_CHART_GROUP_BY);
  const [startIndex, setStartIndex] = useState(0);
  const { data, isLoading, isError, durationUnit } = useTenureDistributionQuery(
    enabled && isDateRangeSelected,
    groupBy,
  );

  const tenureDistributionData = useMemo(
    () => mapTenureDistributionChartComponentToCard(data, durationUnit),
    [data, durationUnit],
  );

  const { title, categories, totals, series, infoText, hasData } = tenureDistributionData;

  useEffect(() => {
    setStartIndex(0);
  }, [categories, dateRange, groupBy]);

  const visibleCategories = useMemo(
    () => categories.slice(startIndex, startIndex + PAGE_SIZE),
    [categories, startIndex],
  );

  const visibleTotals = useMemo(
    () => totals.slice(startIndex, startIndex + PAGE_SIZE),
    [totals, startIndex],
  );

  const visibleSeries = useMemo(
    () =>
      series.map((item) => ({
        ...item,
        percentages: item.percentages.slice(startIndex, startIndex + PAGE_SIZE),
        counts: item.counts.slice(startIndex, startIndex + PAGE_SIZE),
      })),
    [series, startIndex],
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
    return (
      <ErrorCard
        title="Unable to load policies by tenure distribution"
        description="Please try again later."
      />
    );
  }

  return (
    <Card
      className={cn(
        'rounded-geo-distribution-card border-geo-distribution-border flex flex-col gap-4 p-6 pb-0',
        className,
      )}
    >
      {isLoading && isDateRangeSelected ? (
        <GraphCardSkelton chartHeight={CHART_HEIGHT} />
      ) : (
        <div className="flex h-full flex-col gap-4">
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <p className="text-geo-distribution-title text-base leading-6">{title}</p>
              {infoText ? (
                <InfoTooltip
                  infoText={infoText}
                  iconClassName={OVERVIEW_CHART_INFO_TOOLTIP_ICON}
                  arrowClassName={OVERVIEW_CHART_INFO_TOOLTIP_ARROW}
                  className={OVERVIEW_CHART_INFO_TOOLTIP_CLASS}
                />
              ) : null}
            </div>
            <ChartGroupBySelect
              value={groupBy}
              onValueChange={setGroupBy}
              options={periodicGroupByOptions}
            />
          </div>

          <div className="relative flex h-full w-full items-center">
            {!isDateRangeSelected ? (
              <OverviewChartFiltersPrompt />
            ) : hasData ? (
              <>
                {categories.length > PAGE_SIZE ? (
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
                ) : null}
                <GeoDistributionBar
                  categories={visibleCategories}
                  totals={visibleTotals}
                  series={visibleSeries}
                  height={CHART_HEIGHT}
                  barWidth={TENURE_DISTRIBUTION_BAR_WIDTH}
                  showYAxisLabel={SHOW_Y_AXIS_LABEL}
                  showLegend
                />
                {categories.length > PAGE_SIZE ? (
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
                ) : null}
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

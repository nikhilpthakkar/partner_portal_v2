'use client';

import { useEffect, useMemo, useState } from 'react';
import AvgSiTrendLine from '@/components/atoms/AvgSiTrendLine';
import ChartGroupBySelect from '@/components/molecules/ChartGroupBySelect';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import InfoTooltip from '../molecules/InfoTooltip';
import GraphCardSkelton from '@/components/molecules/skeltons/GraphCardSkelton';
import {
  OVERVIEW_CHART_INFO_TOOLTIP_ARROW,
  OVERVIEW_CHART_INFO_TOOLTIP_CLASS,
  OVERVIEW_CHART_INFO_TOOLTIP_ICON,
} from '@/lib/utils/overview/chartTooltip.utils';
import {
  CHART_HEIGHT,
  DEFAULT_CHART_GROUP_BY,
  PAGE_SIZE,
  SHOW_Y_AXIS_LABEL,
} from '@/lib/constants/overview.constants';
import ErrorCard from '../molecules/ErrorCard';
import OverviewChartFiltersPrompt from '../molecules/OverviewChartFiltersPrompt';
import { ChevronLeft, ChevronRight, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAvgSiTrendQuery } from '@/lib/query/overview.queries';
import { mapAvgSiChartComponentToCard } from '@/lib/adapter/overview/avgSiTrend.adapter';
import { useOverviewStore } from '@/lib/store/overview.store';
import { isOverviewChartDateRangeSelected } from '@/lib/utils/overview/overviewChart.utils';
import type { GroupBy } from '@/lib/types/overview';

type AvgSiTrendCardProps = {
  enabled?: boolean;
  className?: string;
};

export default function AvgSiTrendCard({ enabled = true, className }: AvgSiTrendCardProps) {
  const { dateRange } = useOverviewStore();
  const isDateRangeSelected = isOverviewChartDateRangeSelected(dateRange);
  const [groupBy, setGroupBy] = useState<GroupBy>(DEFAULT_CHART_GROUP_BY);
  const [startIndex, setStartIndex] = useState(0);

  const { data, isLoading, isError } = useAvgSiTrendQuery(enabled && isDateRangeSelected, groupBy);
  const avgSiTrendData = useMemo(() => mapAvgSiChartComponentToCard(data), [data]);
  const { title, categories, avgSumInsured, infoText, hasData } = avgSiTrendData;

  useEffect(() => {
    setStartIndex(0);
  }, [categories, dateRange, groupBy]);

  const visibleCategories = useMemo(
    () => categories.slice(startIndex, startIndex + PAGE_SIZE),
    [categories, startIndex],
  );

  const visibleAvgSumInsured = useMemo(
    () => avgSumInsured.slice(startIndex, startIndex + PAGE_SIZE),
    [avgSumInsured, startIndex],
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
        title="Unable to load average sum insured trend"
        description="Please try again later."
      />
    );
  }

  return (
    <Card
      className={cn(
        'rounded-avg-si-trend-card border-avg-si-trend-border flex flex-col gap-6 p-6 pb-0',
        className,
      )}
    >
      {isLoading && isDateRangeSelected ? (
        <GraphCardSkelton chartHeight={CHART_HEIGHT} />
      ) : (
        <div className="flex h-full flex-col gap-6">
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <p className="text-avg-si-trend-title text-base leading-6">{title}</p>
              {infoText ? (
                <InfoTooltip
                  infoText={infoText}
                  iconClassName={OVERVIEW_CHART_INFO_TOOLTIP_ICON}
                  arrowClassName={OVERVIEW_CHART_INFO_TOOLTIP_ARROW}
                  className={OVERVIEW_CHART_INFO_TOOLTIP_CLASS}
                />
              ) : null}
            </div>
            <ChartGroupBySelect value={groupBy} onValueChange={setGroupBy} />
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
                <AvgSiTrendLine
                  categories={visibleCategories}
                  avgSumInsured={visibleAvgSumInsured}
                  height={CHART_HEIGHT}
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

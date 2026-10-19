'use client';

import { useEffect, useMemo, useState } from 'react';
import ChartGroupBySelect from '@/components/molecules/ChartGroupBySelect';
import GeoDistributionBar from '@/components/atoms/GeoDistributionBar';
import GeoDistributionStateSelect from '@/components/molecules/GeoDistributionStateSelect';
import GeoDistributionZoneSelect from '@/components/molecules/GeoDistributionZoneSelect';
import UnderlineTabs from '@/components/molecules/UnderlineTabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import InfoTooltip from '../molecules/InfoTooltip';
import GraphCardSkelton from '@/components/molecules/skeltons/GraphCardSkelton';
import ErrorCard from '../molecules/ErrorCard';
import OverviewChartFiltersPrompt from '../molecules/OverviewChartFiltersPrompt';
import { ChevronLeft, ChevronRight, CircleAlert } from 'lucide-react';
import {
  DEFAULT_GEO_DISTRIBUTION_CLAIM_STATUS,
  DEFAULT_GEO_DISTRIBUTION_TOP_N,
  DEFAULT_GEO_DISTRIBUTION_VIEW,
  DEFAULT_GEO_DISTRIBUTION_ZONES,
  GEO_DISTRIBUTION_BAR_WIDTH,
  GEO_DISTRIBUTION_STATUS_TABS,
  GEO_DISTRIBUTION_VIEW_TABS,
  type GeoDistributionClaimStatus,
  type GeoDistributionView,
} from '@/lib/constants/geoDistribution.constants';
import {
  OVERVIEW_CHART_INFO_TOOLTIP_ARROW,
  OVERVIEW_CHART_INFO_TOOLTIP_CLASS,
  OVERVIEW_CHART_INFO_TOOLTIP_ICON,
} from '@/lib/utils/overview/chartTooltip.utils';
import { CHART_HEIGHT, DEFAULT_CHART_GROUP_BY, PAGE_SIZE, periodicGroupByOptions, SHOW_Y_AXIS_LABEL } from '@/lib/constants/overview.constants';
import { ChartComponentId } from '@/lib/constants/overviewComponents.constants';
import type { GroupBy } from '@/lib/types/overview';
import { useGeoDistributionQuery } from '@/lib/query/overview.queries';
import {
  filterGeoDistributionDataByStates,
  mapGeoDistributionChartComponentToCard,
} from '@/lib/adapter/overview/geoDistribution.adapter';
import { useOverviewStore } from '@/lib/store/overview.store';
import { isOverviewChartDateRangeSelected } from '@/lib/utils/overview/overviewChart.utils';

type GeoDistributionCardProps = {
  componentId:
    | ChartComponentId.GEO_DISTRIBUTION_POLICIES
    | ChartComponentId.GEO_DISTRIBUTION_CLAIMS;
  enabled?: boolean;
  className?: string;
};

export default function GeoDistributionCard({
  componentId,
  enabled = true,
  className,
}: GeoDistributionCardProps) {
  const isClaimsChart = componentId === ChartComponentId.GEO_DISTRIBUTION_CLAIMS;
  const { dateRange } = useOverviewStore();
  const isDateRangeSelected = isOverviewChartDateRangeSelected(dateRange);
  const [groupBy, setGroupBy] = useState<GroupBy>(DEFAULT_CHART_GROUP_BY);
  const [geoView, setGeoView] = useState<GeoDistributionView>(DEFAULT_GEO_DISTRIBUTION_VIEW);
  const [claimStatus, setClaimStatus] = useState<GeoDistributionClaimStatus>(
    DEFAULT_GEO_DISTRIBUTION_CLAIM_STATUS,
  );
  const [isTopNPreset, setIsTopNPreset] = useState(true);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [isAllZonesPreset, setIsAllZonesPreset] = useState(true);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [startIndex, setStartIndex] = useState(0);

  const isZonalView = geoView === 'ZONAL';
  const useTopStatesPreset = !isZonalView && isTopNPreset;
  const hasCustomStateSelection = !isZonalView && !isTopNPreset && selectedStates.length > 0;
  const chartNamedStateLimit =
    isZonalView || hasCustomStateSelection ? undefined : DEFAULT_GEO_DISTRIBUTION_TOP_N;

  const { data, isLoading, isError } = useGeoDistributionQuery(
    componentId,
    {
      geoView,
      groupBy,
      topN: useTopStatesPreset ? DEFAULT_GEO_DISTRIBUTION_TOP_N : undefined,
      states: hasCustomStateSelection ? selectedStates : undefined,
      zones: isZonalView && !isAllZonesPreset ? selectedZones : undefined,
    },
    enabled && isDateRangeSelected,
  );

  const geoDistributionData = useMemo(() => {
    const mapped = mapGeoDistributionChartComponentToCard(
      data,
      geoView,
      chartNamedStateLimit,
      componentId,
      isClaimsChart ? claimStatus : undefined,
    );

    if (isZonalView) {
      if (isAllZonesPreset || selectedZones.length === 0) {
        return mapped;
      }

      return filterGeoDistributionDataByStates(mapped, selectedZones);
    }

    if (isTopNPreset || selectedStates.length === 0) {
      return mapped;
    }

    return filterGeoDistributionDataByStates(mapped, selectedStates);
  }, [data, geoView, chartNamedStateLimit, componentId, isClaimsChart, claimStatus, isZonalView, isAllZonesPreset, selectedZones, isTopNPreset, selectedStates]);

  const { title, categories, totals, series, infoText, hasData } = geoDistributionData;

  const stateOptions = useMemo(
    () =>
      mapGeoDistributionChartComponentToCard(
        data,
        'STATEWISE',
        DEFAULT_GEO_DISTRIBUTION_TOP_N,
        componentId,
        isClaimsChart ? claimStatus : undefined,
      ).series.map((item) => item.name),
    [data, componentId, isClaimsChart, claimStatus],
  );

  const zoneOptions = useMemo(() => {
    const options = mapGeoDistributionChartComponentToCard(
      data,
      'ZONAL',
      undefined,
      componentId,
      isClaimsChart ? claimStatus : undefined,
    ).series.map((item) => item.name);

    return options.length > 0 ? options : [...DEFAULT_GEO_DISTRIBUTION_ZONES];
  }, [data, componentId, isClaimsChart, claimStatus]);

  const handleGeoViewChange = (value: GeoDistributionView) => {
    setGeoView(value);
    setIsTopNPreset(true);
    setSelectedStates([]);
    setIsAllZonesPreset(true);
    setSelectedZones([]);
  };

  useEffect(() => {
    setStartIndex(0);
  }, [categories, geoView, claimStatus, groupBy, isTopNPreset, selectedStates, isAllZonesPreset, selectedZones, dateRange]);

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
        title={
          isClaimsChart
            ? 'Unable to load geo distribution of claims'
            : 'Unable to load geo distribution of policies'
        }
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
            <div className="flex items-center gap-2">
              <ChartGroupBySelect
                value={groupBy}
                onValueChange={setGroupBy}
                options={periodicGroupByOptions}
              />
              {isZonalView ? (
                <GeoDistributionZoneSelect
                  zoneOptions={zoneOptions}
                  isAllZonesPreset={isAllZonesPreset}
                  selectedZones={selectedZones}
                  onAllZonesPresetChange={setIsAllZonesPreset}
                  onSelectedZonesChange={setSelectedZones}
                />
              ) : (
                <GeoDistributionStateSelect
                  stateOptions={stateOptions}
                  isTopNPreset={isTopNPreset}
                  selectedStates={selectedStates}
                  onTopNPresetChange={setIsTopNPreset}
                  onSelectedStatesChange={setSelectedStates}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UnderlineTabs
              variant="line"
              value={geoView}
              onValueChange={(value) => handleGeoViewChange(value as GeoDistributionView)}
              tabs={[...GEO_DISTRIBUTION_VIEW_TABS]}
              className="w-auto"
            />
            {isClaimsChart ? (
              <>
                <div
                  className="h-6 w-px shrink-0 bg-border"
                  aria-hidden="true"
                />
                <UnderlineTabs
                  variant="line"
                  value={claimStatus}
                  onValueChange={(value) => setClaimStatus(value as GeoDistributionClaimStatus)}
                  tabs={[...GEO_DISTRIBUTION_STATUS_TABS]}
                  className="w-auto"
                />
              </>
            ) : null}
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
                  barWidth={GEO_DISTRIBUTION_BAR_WIDTH}
                  borderRadius={8}
                  showYAxisLabel={SHOW_Y_AXIS_LABEL}
                  showLegend
                  valueMode="count"
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

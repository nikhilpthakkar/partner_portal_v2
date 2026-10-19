'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ClaimsTrendBar from '@/components/atoms/ClaimsTrendBar';
import ChartGroupBySelect from '@/components/molecules/ChartGroupBySelect';
import MultiSearchSelect from '@/components/molecules/MultiSearchSelect';
import SimpleSelect from '@/components/molecules/SimpleSelect';
import TooltipCallout from '@/components/molecules/TooltipCallout';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BarClickPayload } from '@/lib/types/overview';
import InfoTooltip from '../molecules/InfoTooltip';
import ClaimsTableDialog from './ClaimsTableDialog';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import type { ClaimStatusGroup, GroupBy } from '@/lib/types/overview';
import type { ClaimsTableData, SeriesKey } from '@/lib/types/overview';
import type { SelectOption } from '@/lib/types/Global';
import {
  statusGroups,
  BAR_WIDTH,
  BORDER_RADIUS,
  CHART_HEIGHT,
  DEFAULT_CHART_GROUP_BY,
  PAGE_SIZE,
  SHOW_Y_AXIS_LABEL,
  statusOptions,
} from '@/lib/constants/overview.constants';
import GraphCardSkelton from '../molecules/skeltons/GraphCardSkelton';
import ErrorCard from '../molecules/ErrorCard';
import OverviewChartFiltersPrompt from '../molecules/OverviewChartFiltersPrompt';
import { ChevronLeft, ChevronRight, CircleAlert } from 'lucide-react';
import { PERMISSIONS } from '@/lib/constants/auth.constants';
import { PermissionGate } from '../atoms/PermissionGate';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import { trackDashboardViewClaimsTableAction } from '@/lib/segment/track/claims';
import { useClaimsTrendQuery } from '@/lib/query/overview.queries';
import { mapClaimsChartComponentToCard } from '@/lib/adapter/overview/claimsTrend.adapter';
import { useOverviewStore } from '@/lib/store/overview.store';
import { isOverviewChartDateRangeSelected } from '@/lib/utils/overview/overviewChart.utils';

type ClaimsTrendCardProps = {
  enabled?: boolean;
  claimsStatus: ClaimStatusGroup[];
  onClaimsStatusChange: (statusGroups: ClaimStatusGroup[]) => void;
  coverOptions: SelectOption[];
  coverIds: string[];
  onCoverIdsChange: (coverIds: string[]) => void;
  coversDisabled?: boolean;
  isCoverOptionsLoading?: boolean;
  isTableLoading?: boolean;
  isTableError?: boolean;
  claimsTableData: ClaimsTableData;
  claimsTableDateRange: DateRange;
  onClaimsTableDateRangeChange: (dateRange: DateRange) => void;
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  className?: string;
};

export default function ClaimsTrendCard({
  enabled = true,
  claimsStatus,
  onClaimsStatusChange,
  coverOptions,
  coverIds,
  onCoverIdsChange,
  coversDisabled,
  isCoverOptionsLoading,
  isTableLoading,
  isTableError,
  claimsTableData,
  claimsTableDateRange,
  onClaimsTableDateRangeChange,
  dialogOpen,
  onDialogOpenChange,
  className,
}: ClaimsTrendCardProps) {
  const segmentBase = useSegmentPartnerBase();
  const { dateRange } = useOverviewStore();
  const isDateRangeSelected = isOverviewChartDateRangeSelected(dateRange);
  const [groupBy, setGroupBy] = useState<GroupBy>(DEFAULT_CHART_GROUP_BY);
  const [claimsTrendPage, setClaimsTrendPage] = useState(1);

  const {
    data: claimsTrendResponse,
    isLoading: isTrendLoading,
    isError: isTrendError,
  } = useClaimsTrendQuery(claimsTrendPage, PAGE_SIZE, enabled && isDateRangeSelected, groupBy);

  const claimsTrendData = useMemo(
    () => mapClaimsChartComponentToCard(claimsTrendResponse),
    [claimsTrendResponse],
  );

  const {
    title,
    categories,
    periodStarts,
    periodEnds,
    periodType,
    paidAmount,
    paid,
    inprogress,
    rejected,
    closed,
    totalClaims,
    infoText,
    hasData,
  } = claimsTrendData;

  const claimsTrendHasPrev = claimsTrendData.pagination.hasPrev;
  const claimsTrendHasNext = claimsTrendData.pagination.hasNext;
  const isLoading = (isTrendLoading && isDateRangeSelected) || Boolean(isCoverOptionsLoading);
  const isError = isTrendError;

  useEffect(() => {
    setClaimsTrendPage(1);
  }, [dateRange, groupBy, coverIds]);

  const [coverFilterSearch, setCoverFilterSearch] = useState('');
  const [statusValue, setStatusValue] = useState<SeriesKey>('all');
  const showData = (status: string, key: SeriesKey) => status === 'all' || status === key;
  const selectionKey = useMemo(
    () => JSON.stringify({ coverIds, periodType, statusValue, categories }),
    [coverIds, periodType, statusValue, categories],
  );
  const [selectedState, setSelectedState] = useState<{
    key: string;
    payload: BarClickPayload;
  } | null>(null);
  const selected = selectedState?.key === selectionKey ? selectedState.payload : null;

  const isBarClickRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => setSelectedState(null);
    document.addEventListener('scroll', handleScroll, true);
    return () => document.removeEventListener('scroll', handleScroll, true);
  }, []);

  const handleDialogOpenChange = useCallback(
    (open: boolean) => {
      onDialogOpenChange(open);
      if (!open) {
        setSelectedState(null);
      }
    },
    [onDialogOpenChange],
  );

  const handleStatusChange = (value: SeriesKey) => {
    setSelectedState(null);
    setStatusValue(value);
  };

  const updateTableStatusValue = (statusValue: SeriesKey) => {
    if (statusValue === 'all' || statusValue === 'totalClaims') {
      onClaimsStatusChange(statusGroups.all as ClaimStatusGroup[]);
    } else {
      onClaimsStatusChange(statusGroups[statusValue as ClaimStatusGroup] as ClaimStatusGroup[]);
    }
  };

  const visibleSeries = {
    totalClaims:
      statusValue === 'paid'
        ? paid
        : statusValue === 'inprogress'
          ? inprogress
          : statusValue === 'rejected'
            ? rejected
            : statusValue === 'closed'
              ? closed
              : totalClaims,
    paid: showData(statusValue, 'paid') ? paid : [],
    inprogress: showData(statusValue, 'inprogress') ? inprogress : [],
    rejected: showData(statusValue, 'rejected') ? rejected : [],
    closed: showData(statusValue, 'closed') ? closed : [],
    periodStarts,
    periodEnds,
  };
  const previousDisabled = !claimsTrendHasPrev;
  const nextDisabled = !claimsTrendHasNext;

  const handleCoverIdsChange = (nextCoverIds: string[]) => {
    onCoverIdsChange(nextCoverIds);
    setClaimsTrendPage(1);
  };

  if (isError) {
    return <ErrorCard title="Unable to load claims trend" description="Please try again later." />;
  }

  return (
    <Card
      className={cn(
        'flex flex-col rounded-claims-trend-card border-claims-trend-border p-4 pb-0',
        className,
      )}
    >
      {isLoading ? (
        <GraphCardSkelton chartHeight={CHART_HEIGHT} />
      ) : (
        <div className="flex flex-col gap-2 h-full">
          <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="text-claims-trend-title text-base leading-6">{title}</p>
              {infoText && (
                <InfoTooltip
                  infoText={infoText}
                  iconClassName="text-claims-trend-icon h-4 w-4"
                  arrowClassName="fill-claims-trend-tooltip"
                  className="bg-claims-trend-tooltip text-claims-trend-tooltip-text rounded-claims-trend-tooltip"
                />
              )}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-start gap-2">
              <ChartGroupBySelect value={groupBy} onValueChange={setGroupBy} />
              <SimpleSelect
                value={statusValue}
                options={statusOptions}
                onValueChange={(value) => handleStatusChange(value as SeriesKey)}
                className="w-half"
              />
              {coverOptions.length > 0 && (
                <MultiSearchSelect
                  label="Covers"
                  values={coverIds}
                  options={coverOptions}
                  onValuesChange={handleCoverIdsChange}
                  searchValue={coverFilterSearch}
                  onSearchChange={setCoverFilterSearch}
                  placeholder="Select covers"
                  emptyLabel="No options"
                  disabled={coversDisabled}
                  contentAlign="end"
                  summaryStyle="compact"
                  deferCommit
                  className="min-w-fit max-w-multi-select-trigger-width w-auto cursor-pointer"
                />
              )}
            </div>
          </div>
          <div className="flex items-center justify-space-between w-full h-full relative">
            {!isDateRangeSelected ? (
              <OverviewChartFiltersPrompt />
            ) : hasData ? (
              <>
                {(claimsTrendHasPrev || claimsTrendHasNext) && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setClaimsTrendPage((prev) => Math.max(1, prev - 1))}
                      disabled={previousDisabled}
                      aria-label="Previous period"
                      className="bg-pagination-background hover:bg-avatar-background"
                    >
                      <ChevronLeft className="!h-5 !w-5" />
                    </Button>
                  </>
                )}
                <ClaimsTrendBar
                  categories={categories}
                  paidAmount={paidAmount}
                  showPaidAmount={statusValue === 'paid'}
                  legendSeries={
                    statusValue === 'all'
                      ? ['In Progress', 'Paid', 'Closed', 'Rejected']
                      : undefined
                  }
                  {...visibleSeries}
                  height={CHART_HEIGHT}
                  barWidth={BAR_WIDTH}
                  borderRadius={BORDER_RADIUS}
                  showYAxisLabel={SHOW_Y_AXIS_LABEL}
                  showLegend
                  onBarClick={(data) => {
                    isBarClickRef.current = true;
                    if (data) {
                      setSelectedState({ key: selectionKey, payload: data });
                    } else {
                      setSelectedState(null);
                    }
                    if (data?.dateRange) onClaimsTableDateRangeChange(data.dateRange);
                    updateTableStatusValue(data?.statusValue as SeriesKey);
                  }}
                />
                {(claimsTrendHasPrev || claimsTrendHasNext) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setClaimsTrendPage((prev) => prev + 1)}
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
                title={'No data available'}
                className="border-none"
              />
            )}
            {!isError && selected ? (
              <PermissionGate permission={PERMISSIONS.VIEW_CLAIMS}>
                <TooltipCallout
                  selected={selected}
                  onAction={() => {
                    trackDashboardViewClaimsTableAction(segmentBase);
                    onDialogOpenChange(true);
                  }}
                  onClose={() => setSelectedState(null)}
                />
              </PermissionGate>
            ) : null}
          </div>
        </div>
      )}
      <ClaimsTableDialog
        open={dialogOpen}
        onClose={handleDialogOpenChange}
        dateRange={claimsTableDateRange}
        onDateRangeChange={onClaimsTableDateRangeChange}
        coverOptions={coverOptions}
        coverIds={coverIds}
        onCoverIdsChange={onCoverIdsChange}
        coversDisabled={coversDisabled}
        claimsTableData={claimsTableData}
        dialogTitle={title}
        isLoading={isTableLoading}
        isError={isTableError}
        statusValue={claimsStatus}
        onStatusChange={onClaimsStatusChange}
      />
    </Card>
  );
}

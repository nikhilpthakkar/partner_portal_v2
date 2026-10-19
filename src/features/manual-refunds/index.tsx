'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';
import { format, formatDistanceToNow, subMonths } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { CircleAlert, Search, X } from 'lucide-react';
import Pagination from '@/components/atoms/Pagination';
import ErrorCard from '@/components/molecules/ErrorCard';
import TruncatedTooltipText from '@/components/molecules/TruncatedTooltipText';
import UnderlineTabs from '@/components/molecules/UnderlineTabs';
import Filters from '@/components/organisms/Filters';
import UpdateManualRefundStatusDialog from '@/components/organisms/UpdateManualRefundStatusDialog';
import ViewManualRefundDetailsSheet from '@/components/organisms/ViewManualRefundDetailsSheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Skeleton from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ROWS_PER_PAGE_OPTIONS } from '@/lib/constants/global.constants';
import {
  MANUAL_REFUND_FILTERS_CONFIG_IDS,
  MANUAL_REFUND_FILTERS_LABELS,
  MANUAL_REFUND_PAGE_COPY,
  MANUAL_REFUND_PRIORITY_FILTER_OPTIONS,
  MANUAL_REFUND_PRIORITY_STYLES,
  MANUAL_REFUND_STATUS_FILTER_OPTIONS,
  MANUAL_REFUND_STATUS_LABELS,
  MANUAL_REFUND_STATUS_STYLES,
  MANUAL_REFUND_TABLE_LABELS,
  MANUAL_REFUND_TAB_STATUSES,
} from '@/lib/constants/manualRefunds.constants';
import {
  useManualRefundsListQuery,
} from '@/lib/query/manualRefunds.queries';
import { usePartnerStore } from '@/lib/store/partner.store';
import type { ApiErrorResponse } from '@/lib/types/Global';
import type { ManualRefundData } from '@/lib/types/manual-refunds/manualRefundsApi';
import { cn, formatEnum, formatExactRefundAmount } from '@/lib/utils';

type StatusTab = 'all' | 'initiated' | 'settled';

const BASE_TABS: Array<{ value: StatusTab; label: string }> = [
  { value: 'all', label: 'All refunds' },
  { value: 'initiated', label: 'Initiated' },
  { value: 'settled', label: 'Settled' },
];

const TABLE_COLUMN_COUNT = 10;

/** BFF list API expects OffsetDateTime; day bounds use IST calendar days. */
const IST_OFFSET = '+05:30';

const isStatusTab = (value: string): value is StatusTab =>
  BASE_TABS.some((tab) => tab.value === value);

const formatTableDate = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, 'MMM d, yyyy');
};

const formatRelativeUpdated = (value?: string | null): string => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return formatDistanceToNow(date, { addSuffix: true });
};

const formatAmount = formatExactRefundAmount;

const formatRefundRequestId = (id: number | string): string => `ID ${String(id).padStart(3, '0')}`;

const formatInitiatedBy = (
  initiatedBy?: { name?: string | null; email?: string | null } | null,
): string => {
  if (!initiatedBy) return '—';
  if (initiatedBy.name?.trim()) return initiatedBy.name.trim();
  if (initiatedBy.email?.trim()) return initiatedBy.email.trim();
  return '—';
};

const formatPartnerName = (
  partnerId: string | null | undefined,
  partnerOptions: Array<{ label: string; value: string }>,
): string => {
  if (!partnerId?.trim()) return '—';
  return partnerOptions.find((option) => option.value === partnerId)?.label ?? partnerId;
};

const formatStatusLabel = (status: string): string =>
  MANUAL_REFUND_STATUS_LABELS[status] ?? formatEnum(status);

const toStartOfDayIso = (date: Date): string =>
  `${format(date, 'yyyy-MM-dd')}T00:00:00${IST_OFFSET}`;

const toEndOfDayIso = (date: Date): string =>
  `${format(date, 'yyyy-MM-dd')}T23:59:59.999${IST_OFFSET}`;

const MANUAL_REFUND_ACTION_BUTTON_CLASSNAME =
  'h-8 hover:border-transparent hover:bg-[#8B5CF6] hover:text-white disabled:hover:bg-secondary disabled:hover:text-secondary-foreground';

const MANUAL_REFUND_ACTION_COLUMN_CLASSNAME = 'w-[160px]';

function ManualRefundsTableSkeleton({ rowCount }: { rowCount: number }) {
  const rows = Array.from({ length: rowCount }, (_, index) => index);

  return (
    <>
      {rows.map((index) => (
        <TableRow
          key={`manual-refund-row-skeleton-${index}`}
          className="border-claims-management-table-border h-[42px]"
        >
          {Array.from({ length: TABLE_COLUMN_COUNT }, (_, cellIndex) => (
            <TableCell key={`manual-refund-cell-skeleton-${index}-${cellIndex}`}>
              <Skeleton className="h-3 w-24" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export default function ManualRefunds() {
  const { productIds, productOptions, partnerOptions } = usePartnerStore();
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [appliedFilterValues, setAppliedFilterValues] = useState<Record<string, string[]>>({
    [MANUAL_REFUND_FILTERS_CONFIG_IDS.planId]: [],
    [MANUAL_REFUND_FILTERS_CONFIG_IDS.status]: [],
    [MANUAL_REFUND_FILTERS_CONFIG_IDS.priority]: [],
  });
  const [searchInput, setSearchInput] = useState('');
  const [appliedPolicyNumber, setAppliedPolicyNumber] = useState('');
  const [selectedRefund, setSelectedRefund] = useState<ManualRefundData | null>(null);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [isViewDetailsSheetOpen, setIsViewDetailsSheetOpen] = useState(false);

  // Keep applied plan IDs in sync with available productIds (prune stale selections).
  useEffect(() => {
    let didPrune = false;
    setAppliedFilterValues((prev) => {
      const stored = prev[MANUAL_REFUND_FILTERS_CONFIG_IDS.planId] ?? [];
      if (stored.length === 0) return prev;
      const idSet = new Set(productIds);
      const pruned = stored.filter((id) => idSet.has(id));
      if (pruned.length === stored.length) return prev;
      didPrune = true;
      return {
        ...prev,
        [MANUAL_REFUND_FILTERS_CONFIG_IDS.planId]: pruned,
      };
    });
    if (didPrune) {
      setPage(1);
    }
  }, [productIds]);

  const selectedPlanIds = useMemo(() => {
    const stored = appliedFilterValues[MANUAL_REFUND_FILTERS_CONFIG_IDS.planId] ?? [];
    if (stored.length === 0) {
      return [...productIds];
    }
    const idSet = new Set(productIds);
    const valid = stored.filter((id) => idSet.has(id));
    if (valid.length === 0) {
      return [...productIds];
    }
    return valid;
  }, [appliedFilterValues, productIds]);

  const selectedStatuses = appliedFilterValues[MANUAL_REFUND_FILTERS_CONFIG_IDS.status] ?? [];
  const selectedPriorities = appliedFilterValues[MANUAL_REFUND_FILTERS_CONFIG_IDS.priority] ?? [];
  const appliedPriority = selectedPriorities.length > 0 ? selectedPriorities[0] : undefined;

  // Filter status takes precedence when exactly one is selected; otherwise use tab.
  const statusFilter = useMemo(() => {
    if (selectedStatuses.length === 1) {
      return selectedStatuses[0];
    }
    if (selectedStatuses.length > 1) {
      return undefined;
    }
    return activeTab === 'all' ? undefined : activeTab;
  }, [selectedStatuses, activeTab]);

  const trimmedPolicyNumber = appliedPolicyNumber.trim();
  const hasPolicySearch = Boolean(searchInput.trim()) || Boolean(trimmedPolicyNumber);

  const { data, isPending, isFetching, isError, error } = useManualRefundsListQuery({
    productIds: selectedPlanIds,
    status: statusFilter,
    priority: appliedPriority,
    policyNumber: trimmedPolicyNumber || undefined,
    fromDate: dateRange.from ? toStartOfDayIso(dateRange.from) : undefined,
    toDate: dateRange.to ? toEndOfDayIso(dateRange.to) : undefined,
    page,
    size: rowsPerPage,
  });

  const refunds = data?.data?.refunds ?? [];
  const pagination = data?.data?.pagination;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const hasRows = refunds.length > 0;
  const showTableSkeleton = isPending;
  const showEmptyState = !showTableSkeleton && !isError && !hasRows;
  const isTableReady = !showTableSkeleton && !isError && hasRows;
  const skeletonRowCount = Math.min(Math.max(rowsPerPage, 5), 12);

  const errorMessage = useMemo(() => {
    if (!error) return null;
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return (
      axiosError.response?.data?.detail ||
      axiosError.response?.data?.message ||
      axiosError.message ||
      MANUAL_REFUND_PAGE_COPY.errorTitle
    );
  }, [error]);

  const planFilterOptions = useMemo(
    () =>
      productIds.map((productId) => ({
        value: productId,
        label: productOptions.find((option) => option.value === productId)?.label ?? productId,
      })),
    [productIds, productOptions],
  );

  const filtersConfig = useMemo(
    () => [
      {
        id: MANUAL_REFUND_FILTERS_CONFIG_IDS.planId,
        placeholder: MANUAL_REFUND_TABLE_LABELS.planId,
        options: planFilterOptions,
      },
      {
        id: MANUAL_REFUND_FILTERS_CONFIG_IDS.status,
        placeholder: MANUAL_REFUND_TABLE_LABELS.status,
        options: MANUAL_REFUND_STATUS_FILTER_OPTIONS,
      },
      {
        id: MANUAL_REFUND_FILTERS_CONFIG_IDS.priority,
        placeholder: MANUAL_REFUND_TABLE_LABELS.priority,
        options: MANUAL_REFUND_PRIORITY_FILTER_OPTIONS,
        multiple: false,
      },
    ],
    [planFilterOptions],
  );

  const handleTabChange = (value: string) => {
    if (!isStatusTab(value)) return;
    setActiveTab(value);
    setAppliedFilterValues((prev) => ({
      ...prev,
      [MANUAL_REFUND_FILTERS_CONFIG_IDS.status]: [],
    }));
    setPage(1);
  };

  const handleApplyFilters = (values: Record<string, string[]>) => {
    const nextStatuses = values[MANUAL_REFUND_FILTERS_CONFIG_IDS.status] ?? [];
    setAppliedFilterValues(values);
    if (nextStatuses.length === 1) {
      if (MANUAL_REFUND_TAB_STATUSES.includes(nextStatuses[0] as (typeof MANUAL_REFUND_TAB_STATUSES)[number])) {
        setActiveTab(nextStatuses[0] as StatusTab);
      }
    } else if (nextStatuses.length > 1) {
      // Multiple statuses ⇒ treat as all; sync tab to All.
      setActiveTab('all');
    }
    // Empty Filters status ⇒ leave activeTab unchanged so tab drives statusFilter.
    setPage(1);
  };

  const handleDateRangeChange = (value: DateRange) => {
    setDateRange(value);
    setPage(1);
  };

  const applyPolicyNumberSearch = (value: string) => {
    const nextValue = value.trim();
    setAppliedPolicyNumber(nextValue);
    setPage(1);
  };

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchInput(value);
    if (value.trim() === '') {
      applyPolicyNumberSearch('');
    }
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      applyPolicyNumberSearch(searchInput);
    }
  };

  const handleClearPolicySearch = () => {
    setSearchInput('');
    applyPolicyNumberSearch('');
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setPage(1);
  };

  const handleOpenUpdateDetails = (refund: ManualRefundData) => {
    setSelectedRefund(refund);
    setIsUpdateStatusDialogOpen(true);
  };

  const handleOpenViewDetails = (refund: ManualRefundData) => {
    setSelectedRefund(refund);
    setIsViewDetailsSheetOpen(true);
  };

  const handleEditDetailsFromSheet = (refund: ManualRefundData) => {
    setSelectedRefund(refund);
    setIsViewDetailsSheetOpen(false);
    setIsUpdateStatusDialogOpen(true);
  };

  const handleUpdateStatusDialogOpenChange = (open: boolean) => {
    setIsUpdateStatusDialogOpen(open);
    if (!open) {
      setSelectedRefund(null);
    }
  };

  const handleViewDetailsSheetOpenChange = (open: boolean) => {
    setIsViewDetailsSheetOpen(open);
    if (!open && !isUpdateStatusDialogOpen) {
      setSelectedRefund(null);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {MANUAL_REFUND_PAGE_COPY.title}
        </h1>
        <p className="text-muted-foreground text-base">{MANUAL_REFUND_PAGE_COPY.description}</p>
      </div>

      <div className="border-claims-management-table-border rounded-claims-management-table flex min-h-0 flex-1 flex-col overflow-hidden border bg-white">
        <div className="border-claims-management-table-border shrink-0 border-b px-4">
          <UnderlineTabs value={activeTab} onValueChange={handleTabChange} tabs={BASE_TABS} />
        </div>
        <div className="border-claims-management-table-border flex shrink-0 items-center gap-2 border-b px-4 py-3">
          <Filters
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
            config={filtersConfig}
            labels={MANUAL_REFUND_FILTERS_LABELS}
            onApply={handleApplyFilters}
            appliedValues={appliedFilterValues}
            align="start"
            className="min-w-0 flex-1"
          />
          <div className="relative w-[240px] shrink-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              placeholder={MANUAL_REFUND_PAGE_COPY.searchPlaceholder}
              aria-label={MANUAL_REFUND_PAGE_COPY.searchPlaceholder}
              className="h-9 rounded-md border border-solid border-[#E5E5E5] bg-white pl-8 pr-9 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:bg-white focus-visible:bg-white"
            />
            {hasPolicySearch ? (
              <button
                type="button"
                onClick={handleClearPolicySearch}
                aria-label={MANUAL_REFUND_PAGE_COPY.searchClearLabel}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-claims-management-table-header-bg sticky top-0 z-20">
              <TableRow className="border-claims-management-table-border h-10">
                <TableHead>
                  <TruncatedTooltipText text={MANUAL_REFUND_TABLE_LABELS.refundRequestId} />
                </TableHead>
                <TableHead>
                  <TruncatedTooltipText text={MANUAL_REFUND_TABLE_LABELS.partner} />
                </TableHead>
                <TableHead>
                  <TruncatedTooltipText text={MANUAL_REFUND_TABLE_LABELS.policyNumber} />
                </TableHead>
                <TableHead>
                  <TruncatedTooltipText text={MANUAL_REFUND_TABLE_LABELS.initiatedBy} />
                </TableHead>
                <TableHead>
                  <TruncatedTooltipText text={MANUAL_REFUND_TABLE_LABELS.date} />
                </TableHead>
                <TableHead>
                  <TruncatedTooltipText text={MANUAL_REFUND_TABLE_LABELS.amount} />
                </TableHead>
                <TableHead>
                  <TruncatedTooltipText text={MANUAL_REFUND_TABLE_LABELS.priority} />
                </TableHead>
                <TableHead>
                  <TruncatedTooltipText text={MANUAL_REFUND_TABLE_LABELS.status} />
                </TableHead>
                <TableHead>
                  <TruncatedTooltipText text={MANUAL_REFUND_TABLE_LABELS.lastUpdated} />
                </TableHead>
                <TableHead className={MANUAL_REFUND_ACTION_COLUMN_CLASSNAME}>
                  <TruncatedTooltipText text={MANUAL_REFUND_TABLE_LABELS.actions} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={cn(isFetching && !showTableSkeleton && hasRows && 'opacity-80')}>
              {showTableSkeleton ? (
                <ManualRefundsTableSkeleton rowCount={skeletonRowCount} />
              ) : null}

              {isError ? (
                <TableRow>
                  <TableCell colSpan={TABLE_COLUMN_COUNT} className="h-48 p-0">
                    <div className="flex h-full items-center justify-center">
                      <div className="w-full max-w-md">
                        <ErrorCard
                          icon={<CircleAlert className="size-8" />}
                          title={MANUAL_REFUND_PAGE_COPY.errorTitle}
                          description={errorMessage || ''}
                          className="border-none shadow-none"
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}

              {showEmptyState ? (
                <TableRow>
                  <TableCell
                    colSpan={TABLE_COLUMN_COUNT}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    {MANUAL_REFUND_PAGE_COPY.emptyTitle}
                  </TableCell>
                </TableRow>
              ) : null}

              {isTableReady
                ? refunds.map((row) => {
                    const status = (row.status ?? '').toLowerCase();
                    const priorityKey = (row.priority ?? '').toUpperCase();
                    return (
                      <TableRow
                        key={row.id}
                        className="border-claims-management-table-border h-[42px]"
                      >
                        <TableCell>
                          <TruncatedTooltipText text={formatRefundRequestId(row.id)} />
                        </TableCell>
                        <TableCell>
                          <TruncatedTooltipText
                            text={formatPartnerName(row.partnerId, partnerOptions)}
                          />
                        </TableCell>
                        <TableCell>
                          <TruncatedTooltipText text={row.policyNumber || '—'} />
                        </TableCell>
                        <TableCell>
                          <TruncatedTooltipText text={formatInitiatedBy(row.initiatedBy)} />
                        </TableCell>
                        <TableCell>
                          <TruncatedTooltipText text={formatTableDate(row.createdOn)} />
                        </TableCell>
                        <TableCell>
                          <TruncatedTooltipText text={formatAmount(row.refundAmount)} />
                        </TableCell>
                        <TableCell>
                          {priorityKey ? (
                            <Badge
                              variant="outline"
                              className={cn(
                                MANUAL_REFUND_PRIORITY_STYLES[priorityKey] ??
                                  'bg-muted text-muted-foreground border-border',
                              )}
                            >
                              {priorityKey}
                            </Badge>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              MANUAL_REFUND_STATUS_STYLES[status] ??
                                'bg-muted text-muted-foreground border-border',
                            )}
                          >
                            {status ? formatStatusLabel(status) : '—'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <TruncatedTooltipText text={formatRelativeUpdated(row.updatedOn)} />
                        </TableCell>
                        <TableCell className={cn('text-center', MANUAL_REFUND_ACTION_COLUMN_CLASSNAME)}>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className={MANUAL_REFUND_ACTION_BUTTON_CLASSNAME}
                            onClick={() =>
                              status === 'initiated'
                                ? handleOpenUpdateDetails(row)
                                : handleOpenViewDetails(row)
                            }
                          >
                            {status === 'initiated'
                              ? MANUAL_REFUND_TABLE_LABELS.updateDetails
                              : MANUAL_REFUND_TABLE_LABELS.viewEditDetails}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                : null}
            </TableBody>
          </Table>
        </div>

        <Pagination
          className="rounded-b-claims-management-table"
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          onRowsPerPageChange={handleRowsPerPageChange}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <UpdateManualRefundStatusDialog
        open={isUpdateStatusDialogOpen}
        onOpenChange={handleUpdateStatusDialogOpenChange}
        refund={selectedRefund}
      />

      <ViewManualRefundDetailsSheet
        open={isViewDetailsSheetOpen}
        onOpenChange={handleViewDetailsSheetOpenChange}
        refund={selectedRefund}
        onEditDetails={handleEditDetailsFromSheet}
      />
    </div>
  );
}

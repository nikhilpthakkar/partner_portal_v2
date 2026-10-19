'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Copy, Download, Hand, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DateRangePicker from '@/components/molecules/DateRangePicker';
import UnderlineTabs from '@/components/molecules/UnderlineTabs';
import TruncatedTooltipText from '@/components/molecules/TruncatedTooltipText';
import InfoTooltip from '@/components/molecules/InfoTooltip';
import DataTable from '@/components/molecules/DataTable';
import { DatadogComponentRenderTracker } from '@/components/datadog/DatadogComponentRenderTracker';
import FloatBalanceCard from '@/components/organisms/FloatBalanceCard';
import RaiseDisputeModal from '@/components/organisms/RaiseDisputeModal';
import AddTransactionModal from '@/components/organisms/AddTransactionModal';
import type { ColumnDef } from '@/lib/types/dataTable';
import type {
  FinancialTab,
  LedgerFilters,
  TransactionSummaryTableRow,
} from '@/lib/types/financials';
import type { SelectOption } from '@/lib/types/Global';
import { useFinancialsStore } from '@/lib/store/financials.store';
import { usePartnerStore } from '@/lib/store/partner.store';
import { usePartnerConfigReady } from '@/lib/hooks/usePartnerConfigReady';
import { PERMISSIONS } from '@/lib/constants/auth.constants';
import { LEDGER_ADJUSTMENT_TOOLTIP_LABELS } from '@/lib/constants/financialsLedger.constants';
import { hasPermission } from '@/lib/utils/permissionUtils';
import { useSegmentPartnerBase } from '@/lib/hooks/useSegmentPartnerBase';
import {
  trackFinancialsAddTransaction,
  trackFinancialsAggregateFilterChange,
  trackFinancialsDataException,
  trackFinancialsExport,
  trackFinancialsPageView,
  trackFinancialsRaiseDispute,
  trackFinancialsSearchUtr,
  trackFinancialsSwitchTopTab,
} from '@/lib/segment/track/financials';
import {
  useExportTransactionSummaryMutation,
  useFloatBalanceQuery,
  useLedgerQuery,
} from '@/lib/query/financials.queries';
import SimpleSelect from '@/components/molecules/SimpleSelect';
import { PageHeading, PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';

const FINANCIAL_TABS: SelectOption[] = [
  { label: 'Ledger summary', value: 'ledger_summary' },
  { label: 'Reports (coming soon)', value: 'reports' },
  { label: 'Settlement (coming soon)', value: 'settlement' },
];

const AGGREGATE_OPTIONS: SelectOption[] = [
  { label: 'Aggregate by: Day', value: 'Day' },
  { label: 'Aggregate by: Month', value: 'Month' },
  { label: 'Aggregate by: Quarter', value: 'Quarter' },
];

function CurrencyCell({
  value,
  decimals = 2,
  absolute = false,
}: {
  value: number | undefined | null;
  decimals?: number;
  absolute?: boolean;
}) {
  const n = absolute ? Math.abs(value ?? 0) : (value ?? 0);
  const formatted = n.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  if (n === 0) {
    return (
      <span className="whitespace-nowrap text-[13px] tabular-nums leading-4 text-muted-foreground">
        {formatted}
      </span>
    );
  }
  return <span className="whitespace-nowrap text-[13px] tabular-nums leading-4">{formatted}</span>;
}

function getIstCalendarParts(date: Date): { y: number; m: number; d: number } {
  const s = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  const [y, m, d] = s.split('-').map(Number);
  return { y, m, d };
}

function relativeDayLabelIst(iso: string): string {
  const d = parseISO(iso);
  const fetched = getIstCalendarParts(d);
  const now = getIstCalendarParts(new Date());
  const tF = Date.UTC(fetched.y, fetched.m - 1, fetched.d);
  const tN = Date.UTC(now.y, now.m - 1, now.d);
  const dayDiff = Math.round((tN - tF) / 86400000);
  if (dayDiff === 0) return 'Today';
  if (dayDiff === 1) return 'Yesterday';
  if (dayDiff < 0) {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  }
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

function formatClockIst(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(parseISO(iso));
}

function formatPeriodLabel(
  row: TransactionSummaryTableRow,
  aggregateBy: LedgerFilters['aggregateBy'],
) {
  if (aggregateBy === 'Month') {
    try {
      return format(parseISO(row.periodStart), 'MMMM, yyyy');
    } catch {
      return row.periodStart;
    }
  }
  if (aggregateBy === 'Quarter') {
    try {
      const start = parseISO(row.periodStart);
      const end = parseISO(row.periodEnd);
      if (row.periodStart === row.periodEnd) {
        return format(start, 'MMM d, yyyy');
      }
      return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
    } catch {
      return row.periodStart;
    }
  }
  try {
    if (row.periodStart === row.periodEnd) {
      return format(parseISO(row.periodStart), 'MMM d, yyyy');
    }
    return `${format(parseISO(row.periodStart), 'MMM d')} – ${format(parseISO(row.periodEnd), 'MMM d, yyyy')}`;
  } catch {
    return row.periodStart;
  }
}

function UtrCell({ value }: { value: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success('UTR copied to clipboard');
  };

  return (
    <div className="flex min-w-0 max-w-full items-center gap-1">
      <div className="min-w-0 flex-1">
        <TruncatedTooltipText text={value} alwaysShowTooltip className="text-sm text-foreground" />
      </div>
      <Button
        variant="ghost"
        size="icon-xs"
        className="shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          handleCopy();
        }}
        aria-label={`Copy ${value}`}
      >
        <Copy className="size-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}

function AmountWithAdjustmentEntries({
  baseAmount,
  adjustmentAmount,
  remarks,
  aggregatedTooltipLabel,
  separateRows = false,
}: {
  baseAmount: number;
  adjustmentAmount: number;
  /** Daily view: API remarks shown on the info icon. */
  remarks?: string;
  /** Month/quarter view: static label shown on the info icon. */
  aggregatedTooltipLabel?: string;
  /** When true (daily view), show only one amount per cell — adjustment rows are already separate. */
  separateRows?: boolean;
}) {
  const hasAdjustment = adjustmentAmount !== 0;
  const tooltipText = hasAdjustment ? (separateRows ? remarks : aggregatedTooltipLabel) : undefined;

  const adjustmentEntry = (
    <span className="inline-flex items-center gap-1">
      <CurrencyCell value={adjustmentAmount} absolute />
      {tooltipText ? (
        <InfoTooltip
          infoText={tooltipText}
          side="top"
          iconClassName="h-3 w-3 shrink-0 text-muted-foreground"
          className="max-w-72"
        />
      ) : null}
    </span>
  );

  if (separateRows) {
    if (hasAdjustment) return adjustmentEntry;
    return <CurrencyCell value={baseAmount} absolute />;
  }

  return (
    <div className="flex flex-col gap-0.5">
      <CurrencyCell value={baseAmount} absolute />
      {hasAdjustment ? adjustmentEntry : null}
    </div>
  );
}

function getPremiumAmount(row: TransactionSummaryTableRow): number {
  return (row.issuanceAmount ?? 0) + (row.endorsementAmount ?? 0);
}

function buildLedgerColumns(
  aggregateBy: LedgerFilters['aggregateBy'],
): ColumnDef<TransactionSummaryTableRow>[] {
  const isDailyView = aggregateBy === 'Day';
  const depositUtrColumn: ColumnDef<TransactionSummaryTableRow> = {
    id: 'depositUtr',
    header: 'UTR',
    accessorKey: 'depositUtr',
    className: 'min-w-0',
    cell: (row) =>
      row.depositUtr ? (
        <UtrCell value={row.depositUtr} />
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  };

  return [
    {
      id: 'date',
      header: 'DATE',
      accessorKey: 'periodStart',
      width: '88px',
      className: 'min-w-0 border-r border-border',
      cell: (row) => (
        <span className="break-words text-sm leading-5 text-foreground">
          {formatPeriodLabel(row, aggregateBy)}
        </span>
      ),
    },
    {
      id: 'depositAmount',
      header: 'DEPOSITS (₹)',
      cell: (row) => (
        <AmountWithAdjustmentEntries
          baseAmount={row.depositAmount ?? 0}
          adjustmentAmount={row.depositAdjustmentAmount ?? 0}
          remarks={row.remarks}
          aggregatedTooltipLabel={LEDGER_ADJUSTMENT_TOOLTIP_LABELS.DEPOSIT}
          separateRows={isDailyView}
        />
      ),
    },
    {
      id: 'premiumAmount',
      header: 'PREMIUM (₹)',
      cell: (row) => (
        <AmountWithAdjustmentEntries
          baseAmount={getPremiumAmount(row)}
          adjustmentAmount={row.premiumAdjustmentAmount ?? 0}
          remarks={row.remarks}
          aggregatedTooltipLabel={LEDGER_ADJUSTMENT_TOOLTIP_LABELS.PREMIUM}
          separateRows={isDailyView}
        />
      ),
    },
    {
      id: 'accountRefundAmount',
      header: 'ACCOUNT REFUND (₹)',
      accessorKey: 'accountRefundAmount',
      cell: (row) => <CurrencyCell value={row.accountRefundAmount} absolute />,
    },
    {
      id: 'floatRefundAmount',
      header: 'FLOAT REFUND (₹)',
      accessorKey: 'cancellationAmount',
      cell: (row) => <CurrencyCell value={row.cancellationAmount} absolute />,
    },
    {
      id: 'tcsAmount',
      header: 'TCS (₹)',
      accessorKey: 'tcsAmount',
      cell: (row) => <CurrencyCell value={row.tcsAmount} absolute />,
    },
    {
      id: 'tdsAmount',
      header: 'TDS (₹)',
      accessorKey: 'tdsAmount',
      cell: (row) => <CurrencyCell value={row.tdsAmount} absolute />,
    },
    ...(isDailyView ? [depositUtrColumn] : []),
    {
      id: 'totalBalance',
      header: 'TOTAL BALANCE (₹)',
      accessorKey: 'totalBalance',
      cell: (row) => (
        <span className="font-medium text-foreground">
          <CurrencyCell value={row.totalBalance} />
        </span>
      ),
    },
  ];
}

export default function Financials() {
  const segmentBase = useSegmentPartnerBase();
  const {
    activeTab,
    setActiveTab,
    selectedRows,
    setSelectedRows,
    clearSelection,
    setPage,
    setPageSize,
    filters,
    setSearchUtr,
    setAggregateBy,
    setDateRange,
    isDisputeModalOpen,
    openDisputeModal,
    closeDisputeModal,
  } = useFinancialsStore();

  const {
    data: floatBalance,
    isLoading: isFloatLoading,
    isError: isFloatError,
  } = useFloatBalanceQuery();
  const { data: ledgerData, isLoading: isLedgerLoading, isError: isLedgerError } = useLedgerQuery();
  const { isReady } = usePartnerConfigReady();
  const { productIds, permissions } = usePartnerStore();
  const { mutateAsync: exportLedger, isPending: isExportingLedger } =
    useExportTransactionSummaryMutation();
  const canRaiseDispute = hasPermission(permissions, PERMISSIONS.RAISE_DISPUTE);
  const canAddTcsTdsTransactions = hasPermission(permissions, PERMISSIONS.ADD_TCS_TDS_TRANSACTIONS);

  const [searchInput, setSearchInput] = useState(filters.searchUtr);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);

  const hasUtrSearch = Boolean(searchInput.trim()) || Boolean(filters.searchUtr.trim());

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim() === '') {
      setSearchUtr('');
    }
  };

  const handleClearUtrSearch = () => {
    setSearchInput('');
    setSearchUtr('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      trackFinancialsSearchUtr(segmentBase, searchInput.trim());
      setSearchUtr(searchInput);
    }
  };

  const handleAggregateByChange = (value: LedgerFilters['aggregateBy']) => {
    trackFinancialsAggregateFilterChange(segmentBase, value);
    setAggregateBy(value);
  };

  const handleTopTabChange = (value: string) => {
    trackFinancialsSwitchTopTab(segmentBase, value);
    setActiveTab(value as FinancialTab);
  };

  const ledgerColumns = useMemo(
    () => buildLedgerColumns(filters.aggregateBy),
    [filters.aggregateBy],
  );

  const selectedEntries = (ledgerData?.transactions ?? []).filter((e) => selectedRows.has(e.id));
  const firstSelected = selectedEntries[0];
  const selectedDisputePeriods = Array.from(
    new Set(selectedEntries.map((entry) => entry.periodStart).filter(Boolean)),
  );

  const firstSelectedPeriodLabel = firstSelected
    ? formatPeriodLabel(firstSelected, filters.aggregateBy)
    : undefined;

  const hasLedgerDateRange = Boolean(filters.dateRange.from && filters.dateRange.to);
  const canExportLedger = isReady && productIds.length > 0 && hasLedgerDateRange;

  useEffect(() => {
    trackFinancialsPageView(segmentBase);
  }, [segmentBase]);

  const exceptionType = useMemo(() => {
    if (isFloatError) return 'float_balance';
    if (isLedgerError) return 'ledger';
  }, [isFloatError, isLedgerError]);

  useEffect(() => {
    if (!(isFloatError || isLedgerError) || !exceptionType) return;
    trackFinancialsDataException(segmentBase, { exception_type: exceptionType });
  }, [exceptionType, isFloatError, isLedgerError, segmentBase]);

  const handleExportLedger = async () => {
    if (!hasLedgerDateRange) {
      toast.error('Select a date range to export');
      return;
    }
    if (!isReady || productIds.length === 0) {
      toast.error('Export is not available right now');
      return;
    }

    try {
      trackFinancialsExport(segmentBase);
      const { data, fileName } = await exportLedger();
      const blobUrl = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 0);
      toast.success('Ledger export downloaded');
    } catch {
      toast.error('Failed to export ledger. Please try again.');
    }
  };

  const handleAddTransaction = () => {
    trackFinancialsAddTransaction(segmentBase);
    setIsAddTransactionModalOpen(true);
  };

  return (
    <div className={PAGE_LAYOUT_CLASS}>
      <PageHeading
        title="Financials"
        subtitle="Monitor float balance, track ledger transactions and manage deposits"
      />

      <div className="flex w-full flex-col gap-2">
        <DatadogComponentRenderTracker name="financials.FloatBalanceCard">
          <FloatBalanceCard data={floatBalance} isLoading={isFloatLoading} />
        </DatadogComponentRenderTracker>
        {!isFloatError ? (
          <p className="text-right text-sm font-light leading-5 text-muted-foreground">
            Financial data updates take 5–6 hours to process.
            {floatBalance?.lastFetched ? (
              <>
                {' '}
                Last updated {formatClockIst(floatBalance.lastFetched)} IST,{' '}
                {relativeDayLabelIst(floatBalance.lastFetched)}
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      <div className="flex w-full flex-col gap-0 overflow-hidden rounded-lg border border-border bg-white">
        <div className="border-b border-border pt-2">
          <UnderlineTabs
            value={activeTab}
            onValueChange={handleTopTabChange}
            tabs={FINANCIAL_TABS}
          />
        </div>

        {activeTab === 'ledger_summary' && (
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-border">
              <div className="w-fit">
                <DateRangePicker value={filters.dateRange} onChange={setDateRange} />
              </div>
              <SimpleSelect
                value={filters.aggregateBy}
                options={AGGREGATE_OPTIONS}
                onValueChange={(val) => handleAggregateByChange(val as 'Day' | 'Month' | 'Quarter')}
                placeholder="Aggregate by"
                className="w-auto"
              />

              {selectedRows.size > 0 && (
                <div className="flex items-center gap-2 rounded-md bg-[#F5F3FF] px-3 py-1.5">
                  <span className="text-sm font-medium text-foreground">
                    {selectedRows.size} Transaction{selectedRows.size > 1 ? 's' : ''} selected
                  </span>
                  <button
                    type="button"
                    className="cursor-pointer text-xs leading-4 font-normal text-[#8B5CF6] hover:underline"
                    onClick={clearSelection}
                  >
                    Clear selection
                  </button>
                </div>
              )}

              <div className="flex-1" />

              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search by UTR number"
                  className="pl-8 pr-9 h-9 rounded-md border border-solid border-[#E5E5E5] bg-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:bg-white focus-visible:bg-white"
                />
                {hasUtrSearch && (
                  <button
                    type="button"
                    onClick={handleClearUtrSearch}
                    aria-label="Clear UTR search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Download ledger export"
                disabled={!canExportLedger || isExportingLedger}
                onClick={handleExportLedger}
              >
                <Download className="size-4" />
              </Button>

              {canAddTcsTdsTransactions ? (
                <Button
                  onClick={handleAddTransaction}
                  className="bg-share-policy-primary text-share-policy-primary-text hover:bg-share-policy-primary-hover border-transparent"
                >
                  Edit Details
                </Button>
              ) : canRaiseDispute ? (
                <Button
                  onClick={() => {
                    trackFinancialsRaiseDispute(segmentBase, selectedRows.size);
                    openDisputeModal();
                  }}
                  disabled={selectedRows.size === 0}
                  className="gap-1.5 bg-share-policy-primary text-share-policy-primary-text hover:bg-share-policy-primary-hover border-transparent"
                >
                  <Hand className="size-4" />
                  Raise dispute
                </Button>
              ) : null}
            </div>

            <DatadogComponentRenderTracker name="financials.LedgerTable">
              <DataTable<TransactionSummaryTableRow>
                columns={ledgerColumns}
                data={ledgerData?.transactions ?? []}
                pagination={ledgerData?.pagination}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                isLoading={isLedgerLoading}
                isError={isLedgerError}
                errorTitle="Failed to load ledger data"
                emptyTitle="No transactions found"
                emptyDescription="No transactions match your current filters."
                selectable
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
                getRowId={(row) => row.id}
                stickyHeader
                compact
                scrollContainerClassName="max-h-[376px] border-b-0"
                frameClassName="rounded-none border-0 border-t border-border bg-transparent"
                rowMerge={{
                  getGroupKey: (row) => row.periodStart,
                  mergeColumnIds: ['date'],
                  mergeCheckbox: true,
                }}
              />
            </DatadogComponentRenderTracker>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
            Reports coming soon
          </div>
        )}

        {activeTab === 'settlement' && (
          <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
            Settlement coming soon
          </div>
        )}
      </div>

      {canRaiseDispute && isDisputeModalOpen && (
        <RaiseDisputeModal
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) closeDisputeModal();
          }}
          selectedEntryPeriods={selectedDisputePeriods}
          selectedEntryDate={firstSelectedPeriodLabel}
          selectedEntryAmount={firstSelected?.totalBalance}
          selectedEntryIds={Array.from(selectedRows)}
        />
      )}

      {canAddTcsTdsTransactions && isAddTransactionModalOpen && (
        <AddTransactionModal open onOpenChange={setIsAddTransactionModalOpen} />
      )}
    </div>
  );
}

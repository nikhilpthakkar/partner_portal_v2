'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Hand, Search, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DataTable from '@/components/molecules/DataTable';
import DateRangePicker from '@/components/molecules/DateRangePicker';
import MetricCard from '@/components/molecules/MetricCard';
import SimpleSelect from '@/components/molecules/SimpleSelect';
import UnderlineTabs from '@/components/molecules/UnderlineTabs';
import { PageHeading, PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';
import type { ColumnDef } from '@/lib/types/dataTable';
import { cn } from '@/lib/utils';
import { exportStatements, money, type FinanceCase } from './domain';
import { buildLedgerRows, type AggregateBy, type LedgerRow } from './ledger';
import { useFinancialWorkspace } from './provider';
import { ApdBanner, DataGate, EmptyState, Picker, SourceLine, StatusPill } from './common';
import { ActionDialog, type ActionRequest } from './actions';

const amount = (paise: number) => (
  <span
    className={cn(
      'whitespace-nowrap tabular-nums text-[13px]',
      paise === 0 && 'text-muted-foreground',
    )}
  >
    {(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  </span>
);
const isOpen = (item: FinanceCase) =>
  ['pending', 'failed', 'open', 'awaiting-activation'].includes(item.status);

function columns(aggregateBy: AggregateBy, all: boolean): ColumnDef<LedgerRow>[] {
  return [
    {
      id: 'date',
      header: 'DATE',
      accessorKey: 'period',
      className: 'min-w-28 border-r border-border',
      cell: (row) => <span className="text-sm">{row.period}</span>,
    },
    ...(all
      ? [
          {
            id: 'van',
            header: 'FINANCIAL ACCOUNT · VAN',
            cell: (row: LedgerRow) => (
              <span className="whitespace-nowrap text-sm font-medium">
                {row.vanId}{' '}
                <span className="font-normal text-muted-foreground">· {row.vanLabel}</span>
              </span>
            ),
          },
        ]
      : []),
    { id: 'deposit', header: 'DEPOSITS (₹)', cell: (row) => amount(row.deposits) },
    { id: 'premium', header: 'PREMIUM (₹)', cell: (row) => amount(row.premium) },
    { id: 'accountRefund', header: 'ACCOUNT REFUND (₹)', cell: (row) => amount(row.accountRefund) },
    { id: 'floatRefund', header: 'FLOAT REFUND (₹)', cell: (row) => amount(row.floatRefund) },
    { id: 'tcs', header: 'TCS (₹)', cell: (row) => amount(row.tcs) },
    { id: 'tds', header: 'TDS (₹)', cell: (row) => amount(row.tds) },
    ...(aggregateBy === 'Day'
      ? [
          {
            id: 'utr',
            header: 'UTR',
            cell: (row: LedgerRow) => (
              <span className="block max-w-48 truncate text-sm" title={row.utrs.join(', ')}>
                {row.utrs.join(', ') || '—'}
              </span>
            ),
          },
        ]
      : []),
    {
      id: 'balance',
      header: 'TOTAL BALANCE (₹)',
      cell: (row) => <span className="font-medium">{amount(row.closing)}</span>,
    },
  ];
}

/** Desktop simulator for the existing Financials ledger with an explicit VAN scope. */
export function FinancialLedger() {
  const {
    snapshot,
    view,
    role,
    scenario,
    selectedVan,
    setSelectedVan,
    failNextAction,
    setFailNextAction,
    pending,
  } = useFinancialWorkspace();
  const [tab, setTab] = useState('ledger_summary');
  const [aggregateBy, setAggregateBy] = useState<AggregateBy>('Day');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(2026, 9, 1),
    to: new Date(2026, 9, 31),
  });
  const [searchInput, setSearchInput] = useState('');
  const [searchUtr, setSearchUtr] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<ActionRequest | null>(null);
  const permitted = view.balances;
  const all = selectedVan === 'all' && permitted.length > 1;
  const account = permitted.find((b) => b.van.id === selectedVan) || permitted[0];
  const shown = all ? permitted : account ? [account] : [];
  const vanIds = shown.map((b) => b.van.id);
  const visibleCases = view.cases.filter((item) => vanIds.includes(item.vanId) && isOpen(item));
  const unmatched = visibleCases.filter((item) => item.kind === 'deposit').length;
  const payouts = visibleCases.filter((item) => item.kind === 'refund').length;
  const rows = buildLedgerRows(view, vanIds, aggregateBy, dateRange.from, dateRange.to, searchUtr);
  const tableColumns = useMemo(() => columns(aggregateBy, all), [aggregateBy, all]);
  const selected = rows.filter((row) => selectedRows.has(row.id));
  const canDispute = view.actor.capabilities.includes('dispute');

  useEffect(() => {
    setAction(null);
    setSelectedRows(new Set());
    setSearchInput('');
    setSearchUtr('');
  }, [role, scenario, snapshot.topology, selectedVan]);

  const download = () => {
    try {
      if (failNextAction) {
        setFailNextAction(false);
        throw new Error(
          'Ledger export failed. Your account and filters are preserved; retry the download.',
        );
      }
      const csv = exportStatements(snapshot, role, vanIds);
      const href = URL.createObjectURL(
        new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }),
      );
      const link = document.createElement('a');
      link.href = href;
      link.download = `${snapshot.groupId}-${all ? 'all-permitted-vans' : vanIds[0]}-statement.csv`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
      toast.success(
        all ? `${vanIds.length} VAN statements downloaded together` : 'VAN statement downloaded',
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Export failed');
    }
  };

  return (
    <div className={cn(PAGE_LAYOUT_CLASS, 'pb-10 pt-6')}>
      <PageHeading
        title="Financials"
        subtitle="Monitor float balance, track ledger transactions and manage deposits"
      />
      <DataGate>
        <ApdBanner compact />
        <section className="finance-panel">
          <div className="finance-panel-head">
            <div>
              <h2>Financials dashboard</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {snapshot.groupName} · financial accounts in your access scope
              </p>
            </div>
            <StatusPill
              status={
                snapshot.dataState === 'ready' && snapshot.reconciliation === 'matched'
                  ? snapshot.apd
                  : 'unverified'
              }
            />
          </div>
          <div className="grid grid-cols-3 gap-4 p-5">
            <MetricCard card={{ label: 'VANs in your scope', value: String(permitted.length) }} />
            <MetricCard card={{ label: 'Deposits awaiting match', value: String(unmatched) }} />
            <MetricCard
              card={{ label: 'Bank payouts pending or failed', value: String(payouts) }}
            />
          </div>
          {visibleCases.length > 0 && (
            <div className="border-t border-border px-5 py-4">
              <p className="text-sm font-medium">Financial alerts</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {visibleCases.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.vanId} · {item.reason}
                      </span>
                    </span>
                    <StatusPill status={item.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <Picker
            label="Financial account · VAN"
            value={all ? 'all' : account?.van.id || ''}
            onChange={setSelectedVan}
            className="min-w-72"
            options={[
              ...(permitted.length > 1
                ? [{ value: 'all', label: `All permitted VANs (${permitted.length})` }]
                : []),
              ...permitted.map((item) => ({
                value: item.van.id,
                label: `${item.van.id} · ${item.van.label}`,
              })),
            ]}
          />
          <SourceLine />
        </div>
        {snapshot.dataState === 'empty' ? (
          <EmptyState
            title="No financial activity yet"
            description="The account is configured, but a verified opening balance and transactions are not available. This is not a confirmed zero balance."
          />
        ) : (
          <>
            <div className={cn('grid gap-4', all ? 'grid-cols-4' : 'grid-cols-3')}>
              {all
                ? shown.map((b) => (
                    <div key={b.van.id} className="rounded-xl border border-border bg-white p-5">
                      <p className="text-sm text-muted-foreground">
                        {b.van.id} · {b.van.label}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{b.van.maskedAccount}</p>
                      <p className="mt-4 text-xs text-muted-foreground">Available</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums">
                        {money(b.available)}
                      </p>
                      <div className="mt-4 flex justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                        <span>Booked {money(b.booked)}</span>
                        <span>Held {money(b.held)}</span>
                      </div>
                    </div>
                  ))
                : account &&
                  [
                    {
                      label: `${account.van.id} · booked balance`,
                      value: money(account.booked),
                      infoText: 'Opening balance plus posted movements for this VAN.',
                    },
                    {
                      label: 'Held for bank payouts',
                      value: money(account.held),
                      infoText: 'Pending and failed payout obligations remain reserved.',
                    },
                    {
                      label: 'Available balance',
                      value: money(account.available),
                      infoText: 'Booked balance less holds for this VAN.',
                    },
                  ].map((card) => (
                    <MetricCard
                      key={card.label}
                      card={card}
                      className="finance-kpi [&_p.text-metric-card-value]:text-2xl"
                    />
                  ))}
            </div>
            {all && (
              <p className="text-xs text-muted-foreground">
                Each card is a separate VAN account. Shared issuance status does not combine their
                ledger balances.
              </p>
            )}
            <div className="overflow-hidden rounded-lg border border-border bg-white">
              <div className="border-b border-border pt-2">
                <UnderlineTabs
                  value={tab}
                  onValueChange={setTab}
                  tabs={[
                    { label: 'Ledger summary', value: 'ledger_summary' },
                    { label: 'Reports (coming soon)', value: 'reports' },
                    { label: 'Settlement (coming soon)', value: 'settlement' },
                  ]}
                />
              </div>
              {tab === 'ledger_summary' ? (
                <>
                  <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <DateRangePicker value={dateRange} onChange={setDateRange} />
                    <SimpleSelect
                      value={aggregateBy}
                      options={['Day', 'Month', 'Quarter'].map((value) => ({
                        value,
                        label: `Aggregate by: ${value}`,
                      }))}
                      onValueChange={(value) => {
                        setAggregateBy(value as AggregateBy);
                        setSelectedRows(new Set());
                      }}
                      placeholder="Aggregate by"
                      className="w-auto"
                    />
                    {selectedRows.size > 0 && (
                      <div className="rounded-md bg-[#F5F3FF] px-3 py-1.5 text-sm">
                        {selectedRows.size} selected{' '}
                        <button
                          type="button"
                          className="ml-2 text-[#8B5CF6] hover:underline"
                          onClick={() => setSelectedRows(new Set())}
                        >
                          Clear selection
                        </button>
                      </div>
                    )}
                    <div className="flex-1" />
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchInput}
                        onChange={(event) => {
                          setSearchInput(event.target.value);
                          if (!event.target.value) setSearchUtr('');
                        }}
                        onKeyDown={(event) => event.key === 'Enter' && setSearchUtr(searchInput)}
                        placeholder="Search by UTR number"
                        className="h-9 pl-8 pr-9"
                      />
                      {searchInput && (
                        <button
                          type="button"
                          aria-label="Clear UTR search"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => {
                            setSearchInput('');
                            setSearchUtr('');
                          }}
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
                      disabled={pending || !view.actor.capabilities.includes('export')}
                      onClick={download}
                    >
                      <Download className="size-4" />
                    </Button>
                    {canDispute && (
                      <Button
                        className="finance-primary"
                        disabled={
                          selected.length !== 1 ||
                          pending ||
                          snapshot.dataState !== 'ready' ||
                          snapshot.reconciliation !== 'matched'
                        }
                        onClick={() =>
                          setAction({
                            type: 'dispute',
                            vanId: selected[0].vanId,
                            reference: selected[0].utrs[0] || selected[0].id,
                          })
                        }
                      >
                        <Hand className="size-4" />
                        Raise dispute
                      </Button>
                    )}
                  </div>
                  {selectedRows.size > 1 && (
                    <p className="px-4 pb-2 text-xs text-muted-foreground">
                      Select one VAN ledger row to raise a dispute.
                    </p>
                  )}
                  <DataTable<LedgerRow>
                    columns={tableColumns}
                    data={rows}
                    selectable={canDispute}
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                    getRowId={(row) => row.id}
                    stickyHeader
                    compact
                    scrollContainerClassName="max-h-[376px] border-b-0"
                    frameClassName="rounded-none border-0 border-t border-border bg-transparent"
                    emptyTitle="No transactions found"
                    emptyDescription="No transactions match this VAN, date range and UTR search."
                  />
                  <div className="flex flex-wrap justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
                    <span>
                      {rows.length} ledger period{rows.length === 1 ? '' : 's'} ·{' '}
                      {all ? `${vanIds.length} separate VANs` : vanIds[0]}
                    </span>
                    <span>
                      Balances are per VAN. Export contains opening, movements and closing for each
                      permitted account.
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[300px] items-center justify-center text-muted-foreground">
                  {tab === 'reports' ? 'Reports' : 'Settlement'} coming soon
                </div>
              )}
            </div>
          </>
        )}
      </DataGate>
      {action && <ActionDialog action={action} onClose={() => setAction(null)} />}
    </div>
  );
}

/** Keeps the existing Manual refunds destination distinct from the Financials ledger. */
export function ManualRefundsPreview() {
  const { view, snapshot } = useFinancialWorkspace();
  const refunds = view.cases.filter((item) => item.kind === 'refund');
  return (
    <div className={cn(PAGE_LAYOUT_CLASS, 'pb-10 pt-6')}>
      <PageHeading
        title="Manual refunds"
        subtitle="Review bank payout status for refunds in your permitted financial accounts."
      />
      <DataGate>
        <SourceLine />
        <section className="finance-panel">
          <div className="finance-panel-head">
            <h2>Bank payout obligations</h2>
            <span className="text-xs text-muted-foreground">
              {snapshot.groupName} · {refunds.length} records
            </span>
          </div>
          {refunds.length ? (
            <div className="divide-y divide-border">
              {refunds.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.vanId} · {item.reference} · {item.owner}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="mb-2 text-sm font-semibold tabular-nums">{money(item.amount)}</p>
                    <StatusPill status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No bank payouts to review"
              description="Pending or failed bank refund obligations in your permitted VANs will appear here."
            />
          )}
        </section>
      </DataGate>
    </div>
  );
}

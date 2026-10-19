'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
import { money, type FinanceCase } from './domain';
import { buildLedgerRows, ledgerCsv, type AggregateBy, type LedgerRow } from './ledger';
import { useFinancialWorkspace } from './provider';
import { ApdBanner, DataGate, EmptyState, Picker, SourceLine, StatusPill } from './common';
import { ActionDialog, type ActionRequest } from './actions';
import { WorkflowDialog } from './workflow-dialogs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const amount = (paise: number) => (
  <span
    className={cn(
      'whitespace-nowrap tabular-nums text-[13px]',
      paise === 0 && 'text-muted-foreground',
      paise < 0 && 'text-red-600',
    )}
  >
    {(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
  </span>
);
const isOpen = (item: FinanceCase) =>
  ['pending', 'failed', 'open', 'awaiting-activation'].includes(item.status);

function columns(
  aggregateBy: AggregateBy,
  all: boolean,
  expanded: boolean,
): ColumnDef<LedgerRow>[] {
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
    ...(expanded
      ? [{ id: 'opening', header: 'OPENING (₹)', cell: (row: LedgerRow) => amount(row.opening) }]
      : []),
    { id: 'deposit', header: 'DEPOSITS (₹)', cell: (row) => amount(row.deposits) },
    { id: 'premium', header: 'PREMIUM (₹)', cell: (row) => amount(row.premium) },
    { id: 'accountRefund', header: 'ACCOUNT REFUND (₹)', cell: (row) => amount(row.accountRefund) },
    { id: 'floatRefund', header: 'FLOAT REFUND (₹)', cell: (row) => amount(row.floatRefund) },
    {
      id: 'bankCredit',
      header: 'BANK REFUND CREDIT (₹)',
      cell: (row) => amount(row.bankRefundCredit),
    },
    ...(expanded
      ? [
          {
            id: 'depositAdjustment',
            header: 'DEPOSIT ADJ. (₹)',
            cell: (r: LedgerRow) => amount(r.depositAdjustment),
          },
          {
            id: 'premiumAdjustment',
            header: 'PREMIUM ADJ. (₹)',
            cell: (r: LedgerRow) => amount(r.premiumAdjustment),
          },
          {
            id: 'depositRefund',
            header: 'REFUND DEPOSIT (₹)',
            cell: (r: LedgerRow) => amount(r.depositRefund),
          },
        ]
      : []),
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
      header: 'CLOSING BALANCE (₹)',
      cell: (row) => <span className="font-medium">{amount(row.closing)}</span>,
    },
    ...(expanded
      ? [
          { id: 'held', header: 'HELD (₹)', cell: (r: LedgerRow) => amount(r.held) },
          { id: 'available', header: 'AVAILABLE (₹)', cell: (r: LedgerRow) => amount(r.available) },
        ]
      : []),
  ];
}

/** Desktop simulator for the existing Financials ledger with an explicit VAN scope. */
export function FinancialLedger() {
  const { partner } = useParams<{ partner: string }>();
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
    execute,
    error,
    clearError,
    unknownOutcome,
    checkOutcome,
  } = useFinancialWorkspace();
  const [expanded, setExpanded] = useState(false);
  const [customVans, setCustomVans] = useState<string[]>([]);
  const [workflow, setWorkflow] = useState<'entry' | null>(null);
  const [refundAction, setRefundAction] = useState<FinanceCase | null>(null);
  const [detail, setDetail] = useState<LedgerRow | null>(null);
  const [decision, setDecision] = useState<{
    id: string;
    action: 'approve' | 'reject' | 'match' | 'resolve';
  } | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
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
  const shown =
    selectedVan === 'custom'
      ? permitted.filter((b) => customVans.includes(b.van.id))
      : all
        ? permitted
        : account
          ? [account]
          : [];
  const vanIds = shown.map((b) => b.van.id);
  const visibleCases = view.cases.filter((item) => vanIds.includes(item.vanId) && isOpen(item));
  const unmatched = visibleCases.filter((item) => item.kind === 'deposit').length;
  const payouts = visibleCases.filter(
    (item) => item.kind === 'refund' && item.destination !== 'float',
  ).length;
  const rows = buildLedgerRows(view, vanIds, aggregateBy, dateRange.from, dateRange.to, searchUtr);
  const tableColumns = columns(aggregateBy, shown.length > 1, expanded);
  const selected = rows.filter((row) => selectedRows.has(row.id));
  const canDispute = view.actor.capabilities.includes('dispute');

  useEffect(() => {
    setAction(null);
    setWorkflow(null);
    setRefundAction(null);
    setDetail(null);
    setDecision(null);
    setSelectedRows(new Set());
    setSearchInput('');
    setSearchUtr('');
  }, [role, scenario, snapshot.topology, selectedVan]);

  useEffect(() => {
    setExpanded(false);
    setCustomVans([]);
  }, [role, scenario, snapshot.topology]);

  const download = () => {
    try {
      if (failNextAction) {
        setFailNextAction(false);
        throw new Error(
          'Ledger export failed. Your account and filters are preserved; retry the download.',
        );
      }
      if (!view.actor.capabilities.includes('export') || !rows.length)
        throw new Error('No permitted rows match this selection.');
      const csv = ledgerCsv(rows, snapshot.cutoff);
      const href = URL.createObjectURL(
        new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' }),
      );
      const link = document.createElement('a');
      link.href = href;
      link.download = `${snapshot.groupId}-${all ? 'all-permitted-vans' : vanIds[0]}-ledger.csv`;
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
        {visibleCases.filter((c) => c.kind !== 'correction').length > 0 && (
          <section className="finance-panel" aria-label="Financial updates">
            <div className="finance-panel-head">
              <h2>Actions you need to take</h2>
            </div>
            {visibleCases
              .filter((c) => c.kind !== 'correction')
              .map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-5 border-t border-border p-5 text-sm"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {c.title} · {c.vanId} · {money(c.amount)}
                    </p>
                    <p className="text-muted-foreground">{c.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      Reference: {c.reference} · Owner: {c.owner}
                    </p>
                    {c.kind === 'refund' && (
                      <p className="text-xs text-muted-foreground">
                        {c.destination === 'float'
                          ? 'This refund stays reserved until verified funding clears the group’s funding deadline. It will then become available for new policies.'
                          : c.status === 'failed'
                            ? 'Funds remain held until the bank confirms payment. Verify the beneficiary before retrying.'
                            : 'Funds remain held while payment is being processed. Do not initiate another transfer.'}
                      </p>
                    )}
                    {!view.actor.capabilities.includes(
                      c.kind === 'deposit'
                        ? 'match'
                        : c.kind === 'dispute'
                          ? 'resolve'
                          : 'settle-refund',
                    ) && (
                      <p className="text-xs">
                        {c.owner} is responsible for the next update. Your access allows you to
                        track this request.
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusPill status={c.status} />
                    {(c.kind === 'deposit' || c.kind === 'dispute') &&
                      view.actor.capabilities.includes(
                        c.kind === 'deposit' ? 'match' : 'resolve',
                      ) && (
                        <Button
                          variant="outline"
                          disabled={pending}
                          onClick={() => {
                            clearError();
                            setDecisionReason('');
                            setDecision({
                              id: c.id,
                              action: c.kind === 'deposit' ? 'match' : 'resolve',
                            });
                          }}
                        >
                          {c.kind === 'deposit' ? 'Verify bank match' : 'Resolve dispute'}
                        </Button>
                      )}
                    {c.kind === 'refund' && c.planId && view.actor.planIds.includes(c.planId) && (
                      <>
                        {c.status === 'failed' &&
                        view.actor.capabilities.includes('settle-refund') ? (
                          <Button
                            className="finance-primary"
                            disabled={
                              pending ||
                              snapshot.dataState !== 'ready' ||
                              snapshot.reconciliation !== 'matched'
                            }
                            onClick={() => setRefundAction(c)}
                          >
                            Verify bank details
                          </Button>
                        ) : null}
                        <Button variant="outline" asChild>
                          <Link
                            href={`/${partner}/dashboard/manual-refunds?refund=${encodeURIComponent(c.id)}`}
                          >
                            View refund details
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
          </section>
        )}

        {view.actor.internal &&
          visibleCases.some((c) => c.kind === 'correction' && c.status === 'pending') && (
            <section className="finance-panel">
              <div className="finance-panel-head">
                <h2>Ledger entries awaiting review</h2>
              </div>
              {visibleCases
                .filter((c) => c.kind === 'correction' && c.status === 'pending')
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center border-t border-border p-4 text-sm"
                  >
                    <div>
                      <p>
                        {c.vanId} · {c.entryKind || 'Premium correction'} · {money(c.amount)}
                      </p>
                      <p className="text-muted-foreground">
                        {c.reference} · {c.reason}
                      </p>
                      <p className="text-xs">
                        Submitted by {c.maker}; balance unchanged until approval.
                      </p>
                    </div>
                    {view.actor.capabilities.includes('approve') && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setDecision({ id: c.id, action: 'reject' })}
                        >
                          Reject
                        </Button>
                        <Button
                          className="finance-primary"
                          onClick={() => {
                            setDecisionReason('');
                            setDecision({ id: c.id, action: 'approve' });
                          }}
                        >
                          Review approval
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
            </section>
          )}
        <section className="finance-panel" aria-label="Financials dashboard">
          <div className="finance-panel-head items-start">
            <div>
              <h2>Financials dashboard</h2>
              <p className="mt-1 mb-3 text-xs text-muted-foreground">
                {snapshot.groupName} · financial accounts in your access scope
              </p>
              <SourceLine />
            </div>
            <Picker
              label="Financial account · VAN"
              value={selectedVan === 'custom' ? 'custom' : all ? 'all' : account?.van.id || ''}
              onChange={setSelectedVan}
              className="min-w-72"
              options={[
                ...(permitted.length > 1
                  ? [
                      { value: 'all', label: `All permitted VANs (${permitted.length})` },
                      { value: 'custom', label: 'Choose VANs…' },
                    ]
                  : []),
                ...permitted.map((item) => ({
                  value: item.van.id,
                  label: `${item.van.id} · ${item.van.label}`,
                })),
              ]}
            />
          </div>
          <div className="space-y-4 p-5">
            {selectedVan === 'custom' && (
              <div className="flex gap-4 rounded-lg border border-border p-4">
                {permitted.map((b) => (
                  <label key={b.van.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={customVans.includes(b.van.id)}
                      onCheckedChange={(v) =>
                        setCustomVans((prev) =>
                          v ? [...prev, b.van.id] : prev.filter((id) => id !== b.van.id),
                        )
                      }
                    />
                    {b.van.id} · {b.van.label}
                  </label>
                ))}
              </div>
            )}
            <div className="grid grid-cols-3 gap-4">
              <MetricCard card={{ label: 'Selected VANs', value: String(shown.length) }} />
              <MetricCard card={{ label: 'Deposits awaiting match', value: String(unmatched) }} />
              <MetricCard
                card={{ label: 'Bank payouts pending or failed', value: String(payouts) }}
              />
            </div>
            {snapshot.dataState !== 'empty' && (
              <>
                <div className={cn('grid gap-4', shown.length > 1 ? 'grid-cols-4' : 'grid-cols-3')}>
                  {shown.length > 1
                    ? shown.map((b) => (
                        <div
                          key={b.van.id}
                          className="rounded-xl border border-border bg-white p-5"
                        >
                          <p className="text-sm text-muted-foreground">
                            {b.van.id} · {b.van.label}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {b.van.maskedAccount}
                          </p>
                          <p className="mt-4 text-xs text-muted-foreground">Available</p>
                          <p
                            className={cn(
                              'mt-1 text-2xl font-semibold tabular-nums',
                              b.available < 0 && 'text-red-600',
                            )}
                          >
                            {money(b.available)}
                          </p>
                          <div className="mt-4 flex justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                            <span className={b.booked < 0 ? 'text-red-600' : ''}>
                              Booked {money(b.booked)}
                            </span>
                            <span>Held {money(b.held)}</span>
                          </div>
                        </div>
                      ))
                    : shown[0] &&
                      [
                        {
                          label: `${shown[0].van.id} · booked balance`,
                          value: money(shown[0].booked),
                          infoText: 'Opening balance plus posted movements for this VAN.',
                        },
                        {
                          label: 'Held funds',
                          value: money(shown[0].held),
                          infoText:
                            'Pending bank refunds and refunds to float raised during grace remain reserved.',
                        },
                        {
                          label: 'Available balance',
                          value: money(shown[0].available),
                          infoText: 'Booked balance less holds for this VAN.',
                        },
                      ].map((card) => (
                        <MetricCard
                          key={card.label}
                          card={card}
                          className={cn(
                            'finance-kpi [&_p.text-metric-card-value]:text-2xl',
                            card.value.startsWith('-') &&
                              '[&_p.text-metric-card-value]:text-red-600',
                          )}
                        />
                      ))}
                </div>
                {all && (
                  <p className="text-xs text-muted-foreground">
                    Each card is a separate VAN account. Shared issuance status does not combine
                    their ledger balances.
                  </p>
                )}
              </>
            )}
            {selectedVan === 'custom' && !shown.length && (
              <p className="text-sm text-muted-foreground">
                Choose at least one VAN to see its balance and statement.
              </p>
            )}
          </div>
          {shown.length > 0 && snapshot.dataState !== 'empty' && (
            <div className="rounded-lg bg-muted p-4 text-sm">
              <strong
                className={shown.reduce((n, b) => n + b.available, 0) < 0 ? 'text-red-600' : ''}
              >
                Selected accounts: {money(shown.reduce((n, b) => n + b.available, 0))} available
              </strong>
              <span className="ml-4 text-muted-foreground">
                Booked {money(shown.reduce((n, b) => n + b.booked, 0))} · Held{' '}
                {money(shown.reduce((n, b) => n + b.held, 0))} · {shown.length} distinct VAN
                {shown.length === 1 ? '' : 's'}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">
                Selection total only. Issuance follows the whole wallet group, including accounts
                outside this selection.
              </p>
            </div>
          )}
        </section>

        {snapshot.dataState === 'empty' ? (
          <EmptyState
            title="No financial activity yet"
            description="The account is configured, but a verified opening balance and transactions are not available. This is not a confirmed zero balance."
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-lg border border-border bg-white">
              <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-3 border-b border-border px-4">
                <UnderlineTabs
                  variant="flush"
                  value={tab}
                  onValueChange={setTab}
                  tabs={[
                    { label: 'Ledger summary', value: 'ledger_summary' },
                    { label: 'Reports (coming soon)', value: 'reports' },
                    { label: 'Settlement (coming soon)', value: 'settlement' },
                  ]}
                />
                {tab === 'ledger_summary' && (
                  <div className="flex items-center gap-3 py-2">
                    <DateRangePicker value={dateRange} onChange={setDateRange} />
                    <SimpleSelect
                      value={aggregateBy}
                      options={['Day', 'Week', 'Month', 'Quarter'].map((value) => ({
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
                  </div>
                )}
              </div>
              {tab === 'ledger_summary' ? (
                <>
                  <div className="flex min-h-14 flex-wrap items-center gap-x-3 border-b border-border px-4">
                    <UnderlineTabs
                      variant="flush"
                      value={expanded ? 'breakdown' : 'summary'}
                      onValueChange={(v) => setExpanded(v === 'breakdown')}
                      tabs={[
                        { value: 'summary', label: 'Summary columns' },
                        { value: 'breakdown', label: 'Balance breakdown' },
                      ]}
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
                      onClick={() => download()}
                    >
                      <Download className="size-4" />
                    </Button>
                    {view.actor.capabilities.includes('post-entry') && (
                      <Button
                        className="finance-primary"
                        disabled={
                          shown.length !== 1 ||
                          pending ||
                          snapshot.dataState !== 'ready' ||
                          snapshot.reconciliation !== 'matched'
                        }
                        onClick={() => setWorkflow('entry')}
                      >
                        Edit Details
                      </Button>
                    )}
                    {canDispute && (
                      <Button
                        variant={
                          view.actor.capabilities.includes('post-entry') ? 'outline' : 'default'
                        }
                        className={
                          view.actor.capabilities.includes('post-entry') ? '' : 'finance-primary'
                        }
                        disabled={
                          selected.length === 0 ||
                          new Set(selected.map((r) => r.vanId)).size !== 1 ||
                          pending ||
                          snapshot.dataState !== 'ready' ||
                          snapshot.reconciliation !== 'matched'
                        }
                        onClick={() =>
                          setAction({
                            type: 'dispute',
                            vanId: selected[0].vanId,
                            reference: selected.map((r) => r.id).join(', '),
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
                      Select rows within one VAN for a single dispute. Cross-VAN disputes need
                      separate requests.
                    </p>
                  )}
                  <DataTable<LedgerRow>
                    columns={tableColumns}
                    data={rows}
                    selectable={canDispute}
                    selectedRows={selectedRows}
                    onSelectionChange={setSelectedRows}
                    getRowId={(row) => row.id}
                    onRowClick={setDetail}
                    stickyHeader
                    compact
                    scrollContainerClassName="max-h-[376px] border-b-0"
                    frameClassName="rounded-none border-0 bg-transparent"
                    emptyTitle="No transactions found"
                    emptyDescription="No transactions match this VAN, date range and UTR search."
                  />
                  <div className="flex flex-wrap justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground">
                    <span>
                      {rows.length} ledger period{rows.length === 1 ? '' : 's'} ·{' '}
                      {all ? `${vanIds.length} separate VANs` : vanIds[0]}
                    </span>
                    <span>
                      Click a row for its calculation and source entries. Exports follow these
                      filters.
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
      {decision && (
        <Dialog
          open
          onOpenChange={(v) => {
            if (!v && !pending) setDecision(null);
          }}
        >
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>
                {decision.action === 'approve'
                  ? 'Approve correction'
                  : decision.action === 'reject'
                    ? 'Reject correction'
                    : decision.action === 'match'
                      ? 'Confirm verified bank match'
                      : 'Resolve dispute'}
              </DialogTitle>
              <DialogDescription>
                {decision.action === 'match'
                  ? 'Check the bank statement against this transfer’s UTR, amount and receiving account. Confirm only when the bank credit is verified. This will credit the selected VAN once and close the unmatched-deposit request.'
                  : decision.action === 'resolve'
                    ? 'Record the investigation outcome and explain the resolution. Closing a dispute does not change the ledger; use a separately approved correction if needed.'
                    : 'Check the original entry and supporting evidence. Approval posts the correction once; rejection leaves the balance unchanged.'}
              </DialogDescription>
            </DialogHeader>
            {(() => {
              const item = view.cases.find((c) => c.id === decision.id);
              return (
                item && (
                  <div className="space-y-2 rounded-lg bg-muted p-4 text-sm">
                    <p className="font-medium">{item.title}</p>
                    <p>
                      Financial account: {item.vanId} ·{' '}
                      {view.balances.find((b) => b.van.id === item.vanId)?.van.label}
                    </p>
                    <p>Amount: {money(item.amount)}</p>
                    <p>Reference: {item.reference}</p>
                    <p>{item.reason}</p>
                  </div>
                )
              );
            })()}
            <Input
              aria-label="Decision reason"
              placeholder="Decision reason (at least 8 characters)"
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
            />
            {error && (
              <p role="alert" className="finance-danger rounded-lg border p-3 text-sm">
                {error}
              </p>
            )}
            {unknownOutcome && (
              <Button
                variant="outline"
                onClick={() => {
                  checkOutcome();
                  setDecision(null);
                  setDecisionReason('');
                }}
              >
                Check request status
              </Button>
            )}
            <Button
              className="finance-primary"
              disabled={
                pending ||
                decisionReason.trim().length < 8 ||
                snapshot.dataState !== 'ready' ||
                snapshot.reconciliation !== 'matched'
              }
              onClick={async () => {
                if (
                  await execute({
                    type: decision.action,
                    caseId: decision.id,
                    reason: decisionReason,
                  })
                ) {
                  setDecision(null);
                  setDecisionReason('');
                }
              }}
            >
              Confirm {decision.action}
            </Button>
          </DialogContent>
        </Dialog>
      )}
      {detail && (
        <Dialog
          open
          onOpenChange={(v) => {
            if (!v) setDetail(null);
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto bg-white">
            <DialogHeader>
              <DialogTitle>
                {detail.vanId} · {detail.period}
              </DialogTitle>
              <DialogDescription>
                Opening plus signed movements equals closing. Held funds are excluded from available
                balance.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-3 rounded-lg bg-muted p-4 text-sm">
              {[
                ['Opening', detail.opening],
                ['Closing', detail.closing],
                ['Held', detail.held],
                ['Available', detail.available],
              ].map(([label, value]) => (
                <p key={label}>
                  {label}
                  <strong className={cn('block', Number(value) < 0 && 'text-red-600')}>
                    {money(Number(value))}
                  </strong>
                </p>
              ))}
            </div>
            <div className="divide-y divide-border">
              {view.movements
                .filter((m) => detail.movementIds.includes(m.id))
                .map((m) => (
                  <div key={m.id} className="py-3 text-sm flex justify-between gap-4">
                    <div>
                      <p className="font-medium">{m.description}</p>
                      {m.source === 'Restricted attribution' && (
                        <p className="mt-1 max-w-md text-xs text-muted-foreground">
                          This shared account also funds plans outside your access. This entry
                          affects the full VAN balance; the other partner’s plan and policy details
                          are restricted.
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {m.kind} · {m.source}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Posted {m.postedAt} · Effective {m.effectiveAt || m.postedAt}
                        {m.corrects ? ` · Corrects ${m.corrects}` : ''}
                      </p>
                    </div>
                    <strong className={m.amount < 0 ? 'text-red-600' : ''}>
                      {money(m.amount)}
                    </strong>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
      {workflow && shown[0] && (
        <WorkflowDialog kind={workflow} vanId={shown[0].van.id} onClose={() => setWorkflow(null)} />
      )}
      {refundAction && (
        <WorkflowDialog
          kind="beneficiary"
          refund={refundAction}
          vanId={refundAction.vanId}
          onClose={() => setRefundAction(null)}
        />
      )}
      {action && <ActionDialog action={action} onClose={() => setAction(null)} />}
    </div>
  );
}

export { ManualRefundsPreview } from './manual-refunds-screen';

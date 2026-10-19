'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DateRangePicker from '@/components/molecules/DateRangePicker';
import type { DateRange } from 'react-day-picker';
import UnderlineTabs from '@/components/molecules/UnderlineTabs';
import DataTable from '@/components/molecules/DataTable';
import { PageHeading, PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { money, type FinanceCase } from './domain';
import { DataGate, EmptyState, Picker, StatusPill, SourceLine } from './common';
import { useFinancialWorkspace } from './provider';
import { WorkflowDialog } from './workflow-dialogs';

export function ManualRefundsPreview() {
  const { snapshot, view, pending } = useFinancialWorkspace();
  const [tab, setTab] = useState('all'),
    [query, setQuery] = useState(''),
    [plan, setPlan] = useState('all');
  const searchParams = useSearchParams();
  const [detail, setDetail] = useState<string | null>(searchParams.get('refund'));
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkVan, setBulkVan] = useState(view.actor.vanIds[0] || '');
  const [bulkReady, setBulkReady] = useState(false);
  const bulkAccounts = view.balances.filter((b) =>
    b.van.plans.some((p) => view.actor.planIds.includes(p.id)),
  );
  const [action, setAction] = useState<'retry' | 'settle' | 'beneficiary' | null>(null);
  // Operational plan grants, independently of access to the whole VAN ledger.
  const allowed = new Set(view.actor.planIds);
  const refunds = snapshot.cases.filter(
    (c) => c.kind === 'refund' && c.destination !== 'float' && c.planId && allowed.has(c.planId),
  );
  const selected = refunds.find((c) => c.id === detail);
  const rows = refunds.filter(
    (c) =>
      (tab === 'all' || (tab === 'settled' ? c.status === 'paid' : c.status !== 'paid')) &&
      (plan === 'all' || c.planId === plan) &&
      `${c.policyId} ${c.reference} ${c.utr || ''}`.toLowerCase().includes(query.toLowerCase()),
  );
  const [priority, setPriority] = useState('all');
  const [range, setRange] = useState<DateRange>({
    from: new Date(2026, 9, 1),
    to: new Date(2026, 9, 31),
  });
  const filteredRows = rows.filter(
    (c) =>
      (priority === 'all' || c.priority === priority) &&
      (!range?.from || !c.createdAt || new Date(c.createdAt) >= range.from) &&
      (!range?.to ||
        !c.createdAt ||
        new Date(c.createdAt) <= new Date(new Date(range.to).setHours(23, 59, 59, 999))),
  );
  const canManage = view.actor.capabilities.includes('settle-refund');
  return (
    <div className={`${PAGE_LAYOUT_CLASS} pt-6 pb-10`}>
      <PageHeading
        title="Manual refunds"
        subtitle="Monitor refund requests, inspect bank responses and update completed transfers."
        actions={
          view.actor.capabilities.includes('bulk-refund') && (
            <Button
              className="finance-primary"
              disabled={
                pending ||
                !bulkAccounts.length ||
                snapshot.dataState !== 'ready' ||
                snapshot.reconciliation !== 'matched'
              }
              onClick={() => {
                setBulkVan(bulkAccounts[0]?.van.id || '');
                setBulkReady(false);
                setBulkOpen(true);
              }}
            >
              Bulk refunds
            </Button>
          )
        }
      />
      <DataGate financial={false}>
        {!view.actor.planIds.length ? (
          <EmptyState
            title="No operational plan access"
            description="VAN statement access does not grant access to customer refund records. Request the relevant plan access."
            icon="access"
          />
        ) : (
          <>
            <SourceLine />
            <div className="rounded-lg border border-border bg-white">
              <UnderlineTabs
                value={tab}
                onValueChange={setTab}
                tabs={[
                  { value: 'all', label: `All refunds (${refunds.length})` },
                  { value: 'initiated', label: 'Initiated' },
                  { value: 'settled', label: 'Settled' },
                ]}
              />
              <div className="flex gap-4 items-end p-4">
                <Input
                  aria-label="Search refunds"
                  placeholder="Search policy number or UTR"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Picker
                  label="Plan"
                  value={plan}
                  onChange={setPlan}
                  options={[
                    { value: 'all', label: 'All permitted plans' },
                    ...view.ownPlans.map((p) => ({ value: p.id, label: p.name })),
                  ]}
                />
                <DateRangePicker value={range} onChange={setRange} />
                <Picker
                  label="Priority"
                  value={priority}
                  onChange={setPriority}
                  options={[
                    { value: 'all', label: 'All priorities' },
                    ...['P0', 'P1', 'P2', 'P3', 'P4'].map((value) => ({ value, label: value })),
                  ]}
                />
                <p className="ml-auto text-xs text-muted-foreground">
                  {filteredRows.length} results · amounts in INR
                </p>
              </div>
              <DataTable<FinanceCase>
                data={filteredRows}
                getRowId={(r) => r.id}
                compact
                columns={[
                  {
                    id: 'id',
                    header: 'REFUND REQUEST',
                    cell: (r) => (
                      <span>
                        {r.id}
                        <small className="block text-muted-foreground">{r.vanId}</small>
                      </span>
                    ),
                  },
                  {
                    id: 'policy',
                    header: 'POLICY / PLAN',
                    cell: (r) => (
                      <span>
                        {r.policyId}
                        <small className="block text-muted-foreground">{r.planId}</small>
                      </span>
                    ),
                  },
                  { id: 'initiated', header: 'INITIATED BY', cell: (r) => <span>{r.maker}</span> },
                  {
                    id: 'date',
                    header: 'INITIATED ON',
                    cell: (r) => (
                      <span>
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                            })
                          : '—'}
                      </span>
                    ),
                  },
                  { id: 'amount', header: 'AMOUNT', cell: (r) => <span>{money(r.amount)}</span> },
                  {
                    id: 'state',
                    header: 'STATUS',
                    cell: (r) => <StatusPill status={r.status === 'paid' ? 'paid' : r.status} />,
                  },
                  {
                    id: 'utr',
                    header: 'UTR',
                    cell: (r) => <span>{r.utr || 'Awaiting settlement'}</span>,
                  },
                  {
                    id: 'action',
                    header: 'ACTION',
                    cell: (r) => (
                      <Button size="sm" variant="outline" onClick={() => setDetail(r.id)}>
                        View details
                      </Button>
                    ),
                  },
                ]}
                emptyTitle="No refunds found"
                emptyDescription={
                  query
                    ? 'Try another policy number or clear your filters.'
                    : 'Approved cancellation refunds for your permitted plans will appear here.'
                }
              />
            </div>
          </>
        )}
      </DataGate>
      {bulkOpen && !bulkReady && (
        <Dialog open onOpenChange={setBulkOpen}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Choose an account for bulk refunds</DialogTitle>
              <DialogDescription>
                Process one VAN at a time. Only accounts with both financial and operational plan
                access are available.
              </DialogDescription>
            </DialogHeader>
            <Picker
              label="Financial account · VAN"
              value={bulkVan}
              onChange={setBulkVan}
              options={bulkAccounts.map((b) => ({
                value: b.van.id,
                label: `${b.van.id} · ${b.van.label}`,
              }))}
            />
            <Button
              className="finance-primary"
              disabled={!bulkAccounts.some((b) => b.van.id === bulkVan)}
              onClick={() => setBulkReady(true)}
            >
              Continue to refunds
            </Button>
          </DialogContent>
        </Dialog>
      )}
      {bulkOpen && bulkReady && (
        <WorkflowDialog
          kind="bulk"
          vanId={bulkVan}
          onClose={() => {
            setBulkOpen(false);
            setBulkReady(false);
          }}
        />
      )}
      {selected && (
        <Dialog
          open
          onOpenChange={(v) => {
            if (!v) setDetail(null);
          }}
        >
          <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Refund details · {selected.id}</DialogTitle>
              <DialogDescription>
                {selected.policyId} · {selected.planId} · {selected.vanId}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4 text-sm">
              <p>
                Amount
                <br />
                <strong>{money(selected.amount)}</strong>
              </p>
              <p>
                Status
                <br />
                <StatusPill status={selected.status} />
              </p>
              <p>
                Provider reference
                <br />
                {selected.reference}
              </p>
              <p>
                Destination
                <br />
                {selected.beneficiary?.holder || 'Sample recipient'} · ••••{' '}
                {selected.beneficiary?.last4 || '4120'}
                <br />
                {selected.beneficiary?.ifsc || 'HDFC0000123'}
              </p>
              <p>
                Completed on
                <br />
                {selected.completedAt
                  ? new Date(selected.completedAt).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                    })
                  : 'Not settled'}
              </p>
              <p>
                UTR
                <br />
                {selected.utr || 'Not available'}
              </p>
            </div>
            <p className="text-sm">{selected.reason}</p>
            <div className="space-y-2">
              {selected.events.map((e) => (
                <div key={e.id} className="border-l-2 border-border pl-3 text-sm">
                  <p>{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.actor} · {e.detail}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {selected.status === 'paid'
                ? 'One settlement debit is recorded; the original obligation is closed.'
                : 'The obligation remains held. A retry does not release it or create a second cancellation credit.'}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDetail(null)}>
                Close
              </Button>
              {canManage && selected.status === 'failed' && (
                <>
                  <Button
                    variant="outline"
                    disabled={pending}
                    onClick={() => setAction('beneficiary')}
                  >
                    Edit bank details
                  </Button>
                  <Button variant="outline" disabled={pending} onClick={() => setAction('retry')}>
                    Retry payout
                  </Button>
                  <Button
                    className="finance-primary"
                    disabled={pending}
                    onClick={() => setAction('settle')}
                  >
                    Update UTR details
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
      {action && selected && (
        <WorkflowDialog
          kind={action}
          refund={selected}
          vanId={selected.vanId}
          onClose={() => setAction(null)}
        />
      )}
    </div>
  );
}

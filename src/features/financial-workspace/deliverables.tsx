'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Skeleton from '@/components/ui/skeleton';
import { EmptyState, Picker, StatusPill } from './common';
import { useFinancialWorkspace } from './provider';
export const COMMUNICATIONS = [
  [
    'low',
    'Balance running low',
    'Finance owner',
    'Review available funds and arrange a top-up before the account enters grace.',
    'Financials',
    'Threshold crossed; deduplicate per funding episode',
  ],
  [
    'grace',
    'Funding needed: grace period started',
    'Finance owner + KAM',
    'New issuance continues during grace. Fund the wallet group before 23 Oct, 6:00 PM IST.',
    'Financials',
    'On entering grace',
  ],
  [
    'grace-reminder',
    'Reminder: funding deadline approaching',
    'Finance owner + KAM',
    'The wallet group is still in grace. Review the current balance and confirm funding before the deadline.',
    'Financials',
    'Every 2 days during grace; stop on recovery',
  ],
  [
    'grace-final',
    'Final reminder: grace ends tomorrow',
    'Finance owner + KAM',
    'New issuance will stop if the wallet group remains negative at the deadline.',
    'Financials',
    'One day before grace expiry',
  ],
  [
    'blocked',
    'New issuance is blocked',
    'Finance owner + operations + KAM',
    'Grace has ended. Fund the group before recovery ends on 27 Oct, 6:00 PM IST. Previously blocked attempts require a new request.',
    'Financials',
    'On grace expiry',
  ],
  [
    'recovery-reminder',
    'Recovery funding reminder',
    'Finance owner + KAM',
    'Recovery is still open. Confirm funding and coordinate affected business operations.',
    'Financials',
    'Every 3 days during recovery',
  ],
  [
    'recovery',
    'Recovery expired: manual review needed',
    'ACKO Finance + Business + KAM',
    'Review eligible policies, sessions and claims exceptions before a cancellation decision. No cancellation has been performed automatically.',
    'Financials',
    'On recovery expiry',
  ],
  [
    'restored',
    'Funding confirmed: issuance restored',
    'Finance owner + operations',
    'Verified funding has restored issuance. Submit previously blocked requests again when appropriate.',
    'Financials',
    'On group recovery; stop outstanding reminders',
  ],
  [
    'deposit',
    'Deposit matched to financial account',
    'Granted VAN finance users',
    'The verified bank credit is now included in your financial statement. Open the entry for its UTR and completed date.',
    'Financials',
    'Once per matched bank credit',
  ],
  [
    'unmatched',
    'Bank credit needs reconciliation',
    'ACKO reconciliation',
    'A bank credit has not yet been matched to a VAN. Investigate the reference before crediting the ledger.',
    'Financials',
    'New unmatched credit',
  ],
  [
    'refund-pending',
    'Your refund is being processed',
    'Customer / permitted refund operator',
    'The refund has been initiated. Settlement is pending; a completed bank reference is not yet available.',
    'Manual refunds',
    'Once per obligation initiation',
  ],
  [
    'refund-failed',
    'Refund could not be completed',
    'Permitted refund operator',
    'Verify the bank response and beneficiary details before retrying. Funds remain held against the original obligation.',
    'Manual refunds',
    'Per failed payout attempt',
  ],
  [
    'refund-paid',
    'Refund completed',
    'Customer / permitted refund operator',
    'Your refund has been completed. The confirmation includes the refund amount, completed date and bank reference from the settlement response.',
    'Manual refunds',
    'Once per settled obligation',
  ],
  [
    'dispute',
    'Dispute received',
    'Submitting finance user',
    'Your discrepancy has been recorded with the VAN and ledger references. Finance will review it; no balance adjustment has been made.',
    'Financials',
    'Once per dispute ID',
  ],
  [
    'correction',
    'Ledger correction needs review',
    'Independent Finance approver',
    'Review the source reference, signed amount, effective date and reason. The original entry remains unchanged.',
    'Financials',
    'Once per pending correction',
  ],
  [
    'correction-posted',
    'Ledger correction posted',
    'Granted VAN finance users',
    'A separate approved adjustment has been added. Open the statement to see the original and corrected period.',
    'Financials',
    'Once per approved adjustment',
  ],
  [
    'access',
    'Your Partner Portal access changed',
    'Affected user',
    'Your administrator updated your permissions. Sign in to view your current financial accounts and operational plans.',
    'Settings',
    'On grant change / deactivation',
  ],
  [
    'source',
    'Financial data update delayed',
    'Finance owner + internal data operations',
    'The last verified snapshot may be out of date. Avoid treating it as current; refresh after the source is reconciled.',
    'Financials',
    'First delay and material escalation only',
  ],
] as const;
export function Deliverables() {
  const [tab, setTab] = useState('communications');
  const [template, setTemplate] = useState<string>('grace');
  const [channel, setChannel] = useState('email');
  const [delivery, setDelivery] = useState('preview');
  const [state, setState] = useState('empty');
  const { snapshot } = useFinancialWorkspace();
  const t = COMMUNICATIONS.find((t) => t[0] === template)!;
  return (
    <div className="space-y-5">
      <div className="flex gap-2 flex-wrap">
        {[
          ['communications', 'Communications'],
          ['states', 'Empty & failure states'],
          ['components', 'UI components'],
          ['contract', 'Developer handoff'],
        ].map(([id, label]) => (
          <Button
            key={id}
            size="sm"
            variant={tab === id ? 'default' : 'outline'}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
        ))}
      </div>
      {tab === 'communications' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Picker
              label="Event / variant"
              value={template}
              onChange={setTemplate}
              options={COMMUNICATIONS.map((t) => ({ value: t[0], label: t[1] }))}
            />
            <Picker
              label="Channel preview"
              value={channel}
              onChange={setChannel}
              options={['email', 'in-app', 'SMS'].map((value) => ({ value, label: value }))}
            />
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted p-4 text-xs">
              <p>TO: {t[2]} · synthetic audience</p>
              <p className="mt-1">
                EVENT: {t[0]} · DESTINATION: {t[4]}
              </p>
            </div>
            <div className="space-y-4 p-6">
              <h3 className="font-semibold">
                {channel === 'SMS' ? 'ACKO Partner Portal' : `${snapshot.groupName}: ${t[1]}`}
              </h3>
              <p className="text-sm leading-6">
                {channel === 'SMS'
                  ? `${t[1]}. Open Partner Portal to review the update within your access scope.`
                  : t[3]}
              </p>
              {channel !== 'SMS' && (
                <Button variant="outline" disabled>
                  Open {t[4]}
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                Preview only. No message is sent. Dynamic amounts, UTRs, deadlines and recipients
                must come from the authorized event; never include another partner’s data.
              </p>
            </div>
          </div>
          <Picker
            label="Delivery state specimen"
            value={delivery}
            onChange={setDelivery}
            options={['preview', 'queued', 'delivered', 'failed', 'suppressed'].map((value) => ({
              value,
              label: value,
            }))}
          />
          <p role="status" className="text-sm">
            <StatusPill status={delivery} />{' '}
            {delivery === 'failed'
              ? 'Provider delivery failed. Retry with the same message key; do not create a duplicate notification.'
              : delivery === 'suppressed'
                ? 'Recipient no longer has access or funding has recovered; cancel the scheduled reminder.'
                : delivery === 'delivered'
                  ? 'Provider acknowledged this example message.'
                  : delivery === 'queued'
                    ? 'Awaiting the configured channel provider.'
                    : 'No delivery attempt.'}
          </p>
          <p className="text-xs text-muted-foreground">
            Trigger / schedule: {t[5]}. Channel and recipient policy require business confirmation.
          </p>
        </>
      )}
      {tab === 'states' && (
        <>
          <Picker
            label="State specimen"
            value={state}
            onChange={setState}
            options={[
              'empty',
              'filtered',
              'loading',
              'error',
              'access',
              'stale',
              'validation',
              'duplicate',
              'unknown-outcome',
            ].map((value) => ({ value, label: value }))}
          />
          {state === 'loading' ? (
            <div role="status" className="space-y-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-40" />
              <p className="text-sm">Loading verified financial data…</p>
            </div>
          ) : ['stale', 'validation', 'duplicate', 'unknown-outcome'].includes(state) ? (
            <div role="alert" className="finance-warning rounded-xl border p-5 text-sm">
              {
                (
                  {
                    stale:
                      'Last verified snapshot is delayed. Posted amounts are historical; current issuance status needs verification.',
                    validation:
                      'Enter a positive amount with no more than two decimals. Keep the entered values and focus the invalid field.',
                    duplicate:
                      'This bank UTR is already recorded. Open the existing entry; no additional credit was posted.',
                    'unknown-outcome':
                      'We have not confirmed the outcome. Keep this request ID and check its status before submitting again. No safe replay is assumed.',
                  } as Record<string, string>
                )[state]
              }
            </div>
          ) : (
            <EmptyState
              icon={state === 'error' ? 'error' : state === 'access' ? 'access' : 'empty'}
              title={
                state === 'empty'
                  ? 'No financial activity yet'
                  : state === 'filtered'
                    ? 'No matching transactions'
                    : state === 'error'
                      ? 'We couldn’t load financial data'
                      : 'Financial access is not included'
              }
              description={
                state === 'empty'
                  ? 'The account is configured; a verified opening balance is not yet available. This is not a confirmed zero.'
                  : state === 'filtered'
                    ? 'Change the date range, selected VANs or UTR search.'
                    : state === 'error'
                      ? 'Retry to retrieve a verified snapshot. Existing requests are preserved.'
                      : 'Ask your access administrator for the required VAN grant.'
              }
            />
          )}
          <p className="text-xs text-muted-foreground">
            These are component specimens. Use Stories to exercise the full-page state and recovery
            path. Story F22 exercises interrupted acknowledgment and status lookup locally;
            production needs a command-status endpoint.
          </p>
        </>
      )}
      {tab === 'components' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-semibold text-sm">Financial status vocabulary</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {['healthy', 'grace', 'blocked', 'pending', 'failed', 'paid', 'unverified'].map(
                (status) => (
                  <StatusPill key={status} status={status} />
                ),
              )}
            </div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-semibold text-sm">Scoped account picker</h3>
            <div className="mt-3">
              <Picker
                label="Financial account · VAN"
                value="all"
                onChange={() => {}}
                options={[{ value: 'all', label: 'All permitted VANs (4)' }]}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Single, all or subset. Selection totals do not replace group APD.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h3 className="font-semibold text-sm">Inline validation</h3>
            <label className="mt-3 block text-sm">
              Completed transfer UTR
              <Input aria-invalid value="" readOnly placeholder="Bank reference" />
            </label>
            <p className="mt-2 text-sm text-destructive">
              Add the completed bank transfer’s unique reference.
            </p>
          </div>
          <div className="rounded-lg border border-border p-4 text-sm">
            <h3 className="font-semibold">Existing components extended</h3>
            <p className="mt-2 text-muted-foreground">
              DataTable, MetricCard, UnderlineTabs, DateRangePicker, Dialog, Checkbox and Input
              remain the base. New compositions: balance reconciliation detail, scoped access
              editor, ledger review, refund timeline and story guide.
            </p>
          </div>
        </div>
      )}
      {tab === 'contract' && (
        <div className="space-y-4 text-sm">
          <h3 className="font-semibold">Replace the gateway; preserve these invariants</h3>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Integer paise, authoritative snapshot cutoff and distinct money event types.</li>
            <li>Server derives actor, VAN and plan grants for every read, mutation and export.</li>
            <li>
              Idempotency key, expected revision and outcome lookup for timeouts after commit.
            </li>
            <li>
              Bank success is correlated to one obligation and one attempt. Retain holds through
              failure.
            </li>
            <li>
              Corrections preserve original entries and require a separate authorized approver.
            </li>
            <li>
              APD uses the complete wallet group and approved hold rules, never the selected subset.
            </li>
          </ol>
          <p className="rounded-lg bg-muted p-4">
            Repository deliverables: docs/financial-completion-handoff.md, docs/coverage-matrix.csv,
            domain tests, story definitions and communication specimens. Simulation demonstrates
            frontend behavior; Cashfree, FinAcko, tax certificates, source reconciliation,
            entitlement enforcement and delivery schedules still need backend implementation.
          </p>
        </div>
      )}
    </div>
  );
}

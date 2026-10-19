'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Picker, StatusPill } from './common';
import { useFinancialWorkspace } from './provider';
import { money, type Movement, type Command, type FinanceCase } from './domain';

export function parseMoney(value: string) {
  if (!/^-?\d+(\.\d{1,2})?$/.test(value.trim()))
    throw new Error('Enter an amount with up to two decimal places.');
  const amount = Math.round(Number(value) * 100);
  if (!Number.isSafeInteger(amount) || amount === 0) throw new Error('Enter a non-zero amount.');
  return amount;
}
export function WorkflowDialog({
  kind,
  vanId,
  refund,
  onClose,
}: {
  kind: 'entry' | 'bulk' | 'settle' | 'retry' | 'beneficiary';
  vanId: string;
  refund?: FinanceCase;
  onClose: () => void;
}) {
  const { snapshot, view, execute, pending, error, clearError, unknownOutcome, checkOutcome } =
    useFinancialWorkspace();
  const [holder, setHolder] = useState(refund?.beneficiary?.holder || '');
  const [bankAccount, setBankAccount] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState(refund?.beneficiary?.ifsc || '');
  const [entryKind, setEntryKind] = useState<Movement['kind']>('deposit');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState('2026-10-17T10:42');
  const [original, setOriginal] = useState('');
  const [plan, setPlan] = useState(
    view.ownPlans.find((p) =>
      snapshot.vans.find((v) => v.id === vanId)?.plans.some((q) => q.id === p.id),
    )?.id || '',
  );
  const [destination, setDestination] = useState<'bank' | 'float'>('bank');
  const [batch, setBatch] = useState('DEMO-POL-2001,1250.00\nDEMO-POL-2002,750.00');
  const [prepared, setPrepared] = useState<Command | null>(null);
  const [validation, setValidation] = useState('');
  const title =
    kind === 'beneficiary'
      ? 'Edit bank details'
      : kind === 'entry'
        ? 'Edit Details'
        : kind === 'bulk'
          ? 'Bulk cancellation refunds'
          : kind === 'retry'
            ? 'Retry bank payout'
            : 'Update UTR details';
  const makeCommand = (): Command => {
    if (reason.trim().length < 8) throw new Error('Add a reason of at least 8 characters.');
    if (kind === 'beneficiary') {
      if (bankAccount !== confirmAccount) throw new Error('Account numbers do not match.');
      return {
        type: 'update-beneficiary',
        caseId: refund!.id,
        holder,
        accountNumber: bankAccount,
        ifsc,
        reason,
      };
    }
    if (kind === 'bulk')
      return {
        type: 'bulk-refund',
        vanId,
        planId: plan,
        destination,
        reason,
        rows: batch
          .trim()
          .split('\n')
          .map((line) => {
            const [policyId, value, ...extra] = line.split(',');
            if (!value || extra.length) throw new Error('Each row needs Policy ID,amount.');
            return { policyId: policyId.trim(), amount: parseMoney(value.trim()) };
          }),
      };
    if (kind === 'retry') return { type: 'retry', caseId: refund!.id, reason };
    if (reference.trim().length < 4)
      throw new Error('Enter the bank UTR or certificate/evidence reference.');
    const effectiveAt = new Date(`${date}:00+05:30`).toISOString();
    if (effectiveAt > snapshot.cutoff)
      throw new Error(
        'The completed date cannot be later than the snapshot (17 Oct 2026, 10:42 IST).',
      );
    if (kind === 'settle')
      return { type: 'settle-refund', caseId: refund!.id, reference, effectiveAt, reason };
    let paise = parseMoney(amount);
    if (entryKind === 'deposit-refund') paise = -Math.abs(paise);
    return {
      type: 'post-entry',
      vanId,
      amount: paise,
      reference,
      reason,
      entryKind,
      effectiveAt,
      originalReference: original,
    };
  };
  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v && !pending) {
          clearError();
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-auto bg-white">
        <DialogHeader>
          <DialogTitle>{prepared ? 'Review and confirm' : title}</DialogTitle>
          <DialogDescription>
            {vanId} ·{' '}
            {kind === 'settle'
              ? 'Record a completed bank transfer only. This releases the existing hold and posts one debit.'
              : kind === 'retry'
                ? 'Retry the existing failed obligation. Its hold remains until bank confirmation.'
                : kind === 'bulk'
                  ? 'Import approved cancellation refunds by policy. Each row becomes a traceable obligation.'
                  : 'Record money against the financial account. Corrections require a different Finance approver.'}
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            clearError();
            setValidation('');
            try {
              if (!prepared) {
                setPrepared(makeCommand());
                return;
              }
              if (await execute(prepared)) onClose();
            } catch (e) {
              setValidation(e instanceof Error ? e.message : 'Check the details.');
            }
          }}
        >
          {prepared ? (
            <div className="rounded-lg border border-border p-4 text-sm space-y-3">
              <p className="font-semibold">
                {title} · {vanId}
              </p>
              {'entryKind' in prepared && (
                <p>
                  {prepared.entryKind} · {money(prepared.amount)} · {prepared.effectiveAt}
                </p>
              )}
              {'rows' in prepared && (
                <>
                  <p>
                    {prepared.rows.length} policies ·{' '}
                    {money(prepared.rows.reduce((n, r) => n + r.amount, 0))} ·{' '}
                    {prepared.destination}
                  </p>
                  {prepared.rows.map((r) => (
                    <p key={r.policyId}>
                      {r.policyId}: {money(r.amount)}
                    </p>
                  ))}
                </>
              )}
              {'reference' in prepared && <p>Reference: {prepared.reference}</p>}
              {refund && (
                <p>
                  {refund.policyId} · {money(refund.amount)}
                </p>
              )}
              {'effectiveAt' in prepared && (
                <p>
                  Completed / effective date:{' '}
                  {new Date(prepared.effectiveAt).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                  })}{' '}
                  IST
                </p>
              )}
              {'originalReference' in prepared && (
                <p>Corrects: {prepared.originalReference || '—'}</p>
              )}
              {'entryKind' in prepared && (
                <p>
                  Projected booked impact:{' '}
                  {prepared.entryKind.includes('adjustment')
                    ? 'No change until approval'
                    : money(prepared.amount)}
                </p>
              )}

              {prepared.type === 'update-beneficiary' && (
                <p>
                  {prepared.holder} · •••• {prepared.accountNumber.slice(-4)} · {prepared.ifsc}
                </p>
              )}
              <p>{reason}</p>
              <p className="text-muted-foreground">
                {kind === 'entry' && entryKind.includes('adjustment')
                  ? 'Balance remains unchanged until independent approval.'
                  : kind === 'retry'
                    ? 'Balance and hold remain unchanged.'
                    : kind === 'bulk'
                      ? 'Bank refunds are held. Float refunds raised in grace remain held until verified funding clears grace.'
                      : 'The financial record will be updated after confirmation.'}
              </p>
            </div>
          ) : (
            <>
              {kind === 'beneficiary' && (
                <>
                  <label className="block text-sm">
                    Account holder
                    <Input required value={holder} onChange={(e) => setHolder(e.target.value)} />
                  </label>
                  <label className="block text-sm">
                    Account number
                    <Input
                      required
                      inputMode="numeric"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                    />
                  </label>
                  <label className="block text-sm">
                    Confirm account number
                    <Input
                      required
                      inputMode="numeric"
                      value={confirmAccount}
                      onChange={(e) => setConfirmAccount(e.target.value)}
                    />
                  </label>
                  <label className="block text-sm">
                    IFSC
                    <Input
                      required
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Use synthetic details in this preview. Only the masked account is kept in the
                    fixture.
                  </p>
                </>
              )}
              {kind === 'entry' && (
                <>
                  <Picker
                    label="Entry type"
                    value={entryKind}
                    onChange={(v) => setEntryKind(v as Movement['kind'])}
                    options={[
                      ['deposit', 'Add deposit'],
                      ['deposit-refund', 'Refund deposit · completed transfer'],
                      ['deposit-adjustment', 'Deposit adjustment'],
                      ['premium-adjustment', 'Premium correction'],
                      ['tds', 'TDS credit'],
                      ['tcs', 'TCS credit'],
                    ].map(([value, label]) => ({ value, label }))}
                  />
                  <label className="block text-sm">
                    Amount (₹)
                    <Input
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </label>
                  {entryKind.includes('adjustment') && (
                    <Picker
                      label="Original entry to correct"
                      value={original}
                      onChange={setOriginal}
                      options={view.movements
                        .filter((m) => m.vanId === vanId)
                        .map((m) => ({ value: m.source, label: `${m.source} · ${m.description}` }))}
                    />
                  )}
                </>
              )}
              {kind === 'bulk' && (
                <>
                  <Picker
                    label="Plan"
                    value={plan}
                    onChange={setPlan}
                    options={view.ownPlans
                      .filter((p) =>
                        snapshot.vans.find((v) => v.id === vanId)?.plans.some((q) => q.id === p.id),
                      )
                      .map((p) => ({ value: p.id, label: p.name }))}
                  />
                  <Picker
                    label="Refund destination"
                    value={destination}
                    onChange={(v) => setDestination(v as 'bank' | 'float')}
                    options={[
                      { value: 'bank', label: 'Customer bank account' },
                      { value: 'float', label: 'Partner float' },
                    ]}
                  />
                  <label className="block text-sm">
                    Policy ID, amount in ₹
                    <Textarea
                      className="mt-2 font-mono"
                      rows={6}
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Fixture eligibility: DEMO-POL-* IDs, positive amounts, no duplicate policy.
                    Production uses the cancellation service’s approved amount and destination. The
                    batch is validated before any row is posted.
                  </p>
                </>
              )}
              {(kind === 'entry' || kind === 'settle') && (
                <>
                  <label className="block text-sm">
                    {entryKind === 'tds' || entryKind === 'tcs'
                      ? 'Certificate / evidence reference'
                      : 'Bank UTR / evidence reference'}
                    <Input
                      required
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </label>
                  <label className="block text-sm">
                    Actual transaction / effective date (IST)
                    <Input
                      type="datetime-local"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      max="2026-10-17T10:42"
                    />
                  </label>
                </>
              )}
              {refund && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p>
                    {refund.policyId} · {money(refund.amount)}
                  </p>
                  <p className="mt-1">
                    {refund.reference} · <StatusPill status={refund.status} />
                  </p>
                </div>
              )}
              <label className="block text-sm">
                {kind === 'retry'
                  ? 'Confirmation of corrected beneficiary details'
                  : 'Reason / supporting evidence'}
                <Textarea
                  required
                  minLength={8}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </label>
            </>
          )}
          {(validation || error) && (
            <p role="alert" className="finance-danger rounded-lg border p-3 text-sm">
              {validation || error}
            </p>
          )}
          <div>
            {unknownOutcome && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  checkOutcome();
                  onClose();
                }}
              >
                Check request status
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => (prepared ? setPrepared(null) : onClose())}
            >
              {prepared ? 'Back to details' : 'Cancel'}
            </Button>
            <Button type="submit" className="finance-primary" disabled={pending}>
              {unknownOutcome
                ? 'Awaiting confirmation'
                : pending
                  ? 'Submitting…'
                  : prepared
                    ? 'Confirm'
                    : 'Review details'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

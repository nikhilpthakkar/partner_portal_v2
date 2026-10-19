'use client';

import { useId, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Clock3, LockKeyhole, RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Skeleton from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useFinancialWorkspace } from './provider';

export function Picker({
  label,
  value,
  options,
  onChange,
  disabled = false,
  className,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full min-w-36 bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone = ['healthy', 'paid', 'approved', 'resolved', 'matched'].includes(status)
    ? 'finance-success'
    : ['failed', 'blocked', 'recovery', 'rejected', 'error'].includes(status)
      ? 'finance-danger'
      : ['pending', 'awaiting-activation', 'open', 'grace', 'low', 'stale', 'mismatch'].includes(
            status,
          )
        ? 'finance-warning'
        : 'finance-neutral';
  return (
    <Badge variant="outline" className={cn('capitalize whitespace-nowrap font-normal', tone)}>
      {status.replaceAll('-', ' ')}
    </Badge>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon = 'empty',
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: 'empty' | 'error' | 'access';
}) {
  const Icon = icon === 'error' ? AlertCircle : icon === 'access' ? LockKeyhole : Inbox;
  return (
    <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
      <div className="rounded-full bg-muted p-3">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

export function DataGate({
  children,
  financial = true,
}: {
  children: ReactNode;
  financial?: boolean;
}) {
  const { snapshot, view, system, pending } = useFinancialWorkspace();
  if (snapshot.dataState === 'loading')
    return (
      <div role="status" aria-label="Loading financial data" className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((n) => (
            <Skeleton key={n} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <p className="text-sm text-muted-foreground">Loading the verified financial snapshot…</p>
      </div>
    );
  if (snapshot.dataState === 'error')
    return (
      <EmptyState
        icon="error"
        title="We couldn’t load financial data"
        description="No balance is being shown. Retry to retrieve a verified snapshot. Your workflow requests are preserved."
        action={
          <Button variant="outline" disabled={pending} onClick={() => system('refresh')}>
            <RefreshCw />
            Retry loading
          </Button>
        }
      />
    );
  if (
    snapshot.dataState === 'no-access' ||
    (financial && !view.actor.capabilities.includes('view'))
  )
    return (
      <EmptyState
        icon="access"
        title="Financial access is not included"
        description="Your partner and plan access does not grant access to VAN statements. Ask your access administrator for the specific wallet group and VAN grant you need."
      />
    );
  return children;
}

export function ApdBanner({ compact = false }: { compact?: boolean }) {
  const { snapshot } = useFinancialWorkspace();
  const uncertain = snapshot.dataState !== 'ready' || snapshot.reconciliation === 'mismatch';
  const mode = uncertain ? 'unknown' : snapshot.apd;
  const content = {
    healthy: [
      'Issuance is active',
      'Your wallet group is funded. All mapped plans follow this APD state.',
    ],
    low: ['Balance is running low', 'Review funding now to reduce the risk of entering grace.'],
    grace: [
      'Action needed · wallet group in grace',
      'Issuance continues until 23 Oct, 6:00 PM IST. Arrange funding with your finance owner before the deadline.',
    ],
    blocked: [
      'New issuance is blocked',
      'Grace has ended for the whole wallet group. Recovery is due 27 Oct, 6:00 PM IST. Blocked attempts do not replay automatically.',
    ],
    recovery: [
      'Recovery expired · manual review required',
      'Finance and Business must review affected policies and claims exceptions. No automatic cancellation has occurred.',
    ],
    unknown: [
      'Current APD status needs verification',
      'Source data is incomplete or delayed. The last verified snapshot cannot confirm the current issuance state.',
    ],
  }[mode];
  const Icon =
    mode === 'healthy' ? CheckCircle2 : mode === 'grace' || mode === 'low' ? Clock3 : AlertCircle;
  return (
    <section
      className={cn(
        'finance-banner',
        mode === 'healthy'
          ? 'finance-success'
          : ['blocked', 'recovery'].includes(mode)
            ? 'finance-danger'
            : 'finance-warning',
      )}
      role="status"
    >
      <Icon className="size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{content[0]}</div>
        <p className="mt-1 text-sm leading-5 opacity-90">{content[1]}</p>
        {!compact && (
          <p className="mt-2 text-xs opacity-75">
            {snapshot.groupName} wallet group · {snapshot.memberVanIds.length} distinct VANs ·
            mapping v{snapshot.mappingVersion}
          </p>
        )}
      </div>
    </section>
  );
}

export function SourceLine() {
  const { snapshot } = useFinancialWorkspace();
  return (
    <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <span
        className={cn(
          'size-1.5 rounded-full',
          snapshot.dataState === 'ready' && snapshot.reconciliation === 'matched'
            ? 'bg-balance-coverage-current'
            : 'bg-balance-coverage-recharge-primary',
        )}
      />
      {snapshot.dataState === 'stale' ? 'Last verified' : 'Source cutoff'}:{' '}
      {new Date(snapshot.cutoff).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })}{' '}
      IST<span>·</span>
      <span>
        {snapshot.dataState === 'empty'
          ? 'Awaiting initial verified snapshot'
          : snapshot.dataState === 'stale'
            ? 'Current source confirmation pending'
            : snapshot.reconciliation === 'mismatch'
              ? 'Reconciliation mismatch · investigate before acting'
              : 'Sources reconciled'}
      </span>
    </p>
  );
}

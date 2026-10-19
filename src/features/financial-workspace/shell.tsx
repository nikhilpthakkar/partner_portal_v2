'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  Banknote,
  Bell,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  FileText,
  FlaskConical,
  LayoutDashboard,
  LifeBuoy,
  RotateCcw,
  Settings2,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { AppImage } from '@/components/atoms/AppImage';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ROLE_LABELS, SCENARIOS, type Role, type Scenario, type Topology } from './domain';
import { Picker, EmptyState } from './common';
import { useFinancialWorkspace } from './provider';
import './workspace.css';

export function FinancialSimulatorShell({ children }: { children: ReactNode }) {
  const {
    snapshot,
    view,
    role,
    setRole,
    scenario,
    configure,
    system,
    pending,
    failNextAction,
    setFailNextAction,
    setApdBasis,
    markRead,
  } = useFinancialWorkspace();
  const [controls, setControls] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [support, setSupport] = useState(false);
  const [emailPreview, setEmailPreview] = useState(false);
  const pathname = usePathname();
  const params = useParams<{ partner: string }>();
  const router = useRouter();
  const base = `/${params.partner}/dashboard`;
  const unread = view.notices.filter((n) => !n.read).length;
  const nav = [
    { label: 'Overview', path: 'overview', icon: LayoutDashboard },
    { label: 'Policy management', path: 'policy-management', icon: FileText, unavailable: true },
    {
      label: 'Claims management',
      path: 'claims-management',
      icon: ClipboardList,
      unavailable: true,
    },
    { label: 'Financials', path: 'financials', icon: WalletCards },
    ...(view.actor.internal
      ? [{ label: 'Manual refunds', path: 'manual-refunds', icon: Banknote }]
      : []),
    { label: 'Statements & reports', path: 'reports', icon: FileText },
  ];
  const supported = ['overview', 'financials', 'manual-refunds', 'reports'].some((p) =>
    pathname.endsWith('/' + p),
  );
  const links = nav.map((item) => (
    <div key={item.path}>
      {item.unavailable ? (
        <button
          type="button"
          onClick={() => setSupport(true)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground"
          title="Requires the connected backend"
        >
          <item.icon className="size-4" />
          {item.label}
        </button>
      ) : (
        <Link
          href={`${base}/${item.path}`}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-sidebar-accent',
            pathname.endsWith('/' + item.path) && 'bg-sidebar-accent font-medium',
          )}
          aria-current={pathname.endsWith('/' + item.path) ? 'page' : undefined}
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      )}
    </div>
  ));
  return (
    <div className="financial-workspace flex h-screen overflow-x-auto bg-background text-foreground">
      <aside className="finance-desktop-sidebar flex w-64 shrink-0 flex-col p-3">
        <Link href={`${base}/overview`} className="px-3 py-4 text-lg font-semibold">
          Partner Portal
        </Link>
        <nav aria-label="Main navigation" className="mt-4 space-y-1">
          {links}
        </nav>
        <div className="mt-auto space-y-3 pt-6">
          <button
            onClick={() => setSupport(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted"
          >
            <LifeBuoy className="size-4" />
            Support
          </button>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-xs text-primary-foreground">
              {view.actor.internal ? 'AK' : snapshot.topology === 'eternal' ? 'ZO' : 'CR'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {view.actor.internal ? 'ACKO Finance' : view.actor.partnerIds.join(', ')}
              </p>
              <p className="truncate text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 border-t border-border py-4 text-xs">
            Powered by{' '}
            <AppImage
              src="/images/acko-enterprise-logo.svg"
              alt="ACKO Enterprise"
              width={80}
              height={20}
            />
          </div>
          <Button
            variant="outline"
            className="w-full text-share-policy-primary"
            onClick={() => setControls(true)}
          >
            <FlaskConical />
            Workflow simulator
          </Button>
          <p className="text-center text-[10px] text-muted-foreground">
            LOCAL PREVIEW · SYNTHETIC DATA
          </p>
        </div>
      </aside>
      <div className="m-2 flex min-w-[960px] flex-1 flex-col overflow-hidden rounded-xl bg-card shadow-sm">
        <header className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-border px-6 py-2">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-icon-select-accent-bg text-sm font-semibold text-share-policy-primary">
              {snapshot.groupName.slice(0, 1)}
            </div>
            <div>
              <p className="text-sm font-semibold">{snapshot.groupName}</p>
              <p className="text-[11px] text-muted-foreground">
                Wallet group ·{' '}
                {view.actor.internal
                  ? 'Internal finance workspace'
                  : view.actor.partnerIds.join(', ')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Notifications, ${unread} unread`}
              onClick={() => setNotifications(true)}
              className="relative"
            >
              <Bell />
              {unread > 0 && (
                <span className="absolute right-1 top-1 size-2 rounded-full bg-share-policy-primary" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setControls(true)}>
              <Settings2 />
              Simulator
            </Button>
          </div>
        </header>
        <main className="finance-scroll min-w-0 flex-1 overflow-auto" id="main-content">
          {supported ? (
            children
          ) : (
            <div className="p-6">
              <EmptyState
                title="This module uses the connected backend"
                description="This local workspace covers Overview, Financials, Manual refunds and Statements. Connect the existing API mode to use the operational modules."
                action={
                  <Button asChild variant="outline">
                    <Link href={`${base}/overview`}>Back to overview</Link>
                  </Button>
                }
              />
            </div>
          )}
        </main>
      </div>

      <Dialog open={controls} onOpenChange={setControls}>
        <DialogContent className="left-auto right-0 top-0 flex h-dvh w-full max-w-md translate-x-0 translate-y-0 flex-col overflow-y-auto rounded-none bg-white p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="size-5 text-share-policy-primary" />
              Workflow simulator
            </DialogTitle>
            <DialogDescription>
              Change the context, then use the actual page actions. All data and notifications stay
              in this local session.
            </DialogDescription>
          </DialogHeader>
          <div className="finance-simulator-grid">
            <Picker
              label="Wallet group example"
              value={snapshot.topology}
              onChange={(v) => void configure(v as Topology, scenario)}
              disabled={pending}
              options={[
                { value: 'eternal', label: 'Eternal · 4 VANs, 4 partners' },
                { value: 'cred', label: 'Cred · V2 shared by 2 partners' },
              ]}
            />
            <Picker
              label="Preview as"
              value={role}
              onChange={(v) => setRole(v as Role)}
              disabled={pending}
              options={Object.entries(ROLE_LABELS)
                .filter(([key]) =>
                  key === 'credit-vidya'
                    ? snapshot.topology === 'cred'
                    : key === 'eternal-group-finance'
                      ? snapshot.topology === 'eternal'
                      : true,
                )
                .map(([value, label]) => ({ value, label }))}
            />
            <Picker
              label="Load a scenario (resets workflow changes)"
              value={scenario}
              onChange={(v) => void configure(snapshot.topology, v as Scenario)}
              disabled={pending}
              options={Object.entries(SCENARIOS).map(([value, label]) => ({ value, label }))}
            />
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-xs leading-5">
              <strong>Scope in this preview</strong>
              <p className="mt-1 text-muted-foreground">
                Financial VANs: {view.actor.vanIds.join(', ') || 'None'}. Operational plans:{' '}
                {view.ownPlans.length}. View-only users cannot submit money actions.
              </p>
            </div>
            <div className="border-t border-border pt-4">
              <h3 className="mb-2 text-sm font-semibold">Simulate an external event</h3>
              <p className="mb-3 text-xs text-muted-foreground">
                These controls represent service callbacks, not user permissions.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending || snapshot.apd !== 'grace'}
                  onClick={() => system('expire-grace')}
                >
                  Expire grace
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending || snapshot.apd !== 'blocked'}
                  onClick={() => system('expire-recovery')}
                >
                  Expire recovery
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    pending ||
                    !snapshot.cases.some((c) => c.kind === 'refund' && c.status === 'pending')
                  }
                  onClick={() => system('payout-success')}
                >
                  Payout succeeds
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    pending ||
                    !snapshot.cases.some((c) => c.kind === 'refund' && c.status === 'pending')
                  }
                  onClick={() => system('payout-failure')}
                >
                  Payout fails
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => system('refresh')}
                >
                  Sources refresh
                </Button>
              </div>
            </div>
            <label className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm">
              <Checkbox
                checked={failNextAction}
                disabled={pending}
                onCheckedChange={(v) => setFailNextAction(v === true)}
                aria-label="Fail the next action"
              />
              <span>
                Fail the next submitted action
                <small className="mt-1 block text-xs text-muted-foreground">
                  Verify error recovery and preserved form entries.
                </small>
              </span>
            </label>
            <Picker
              label="APD policy hypothesis · Finance sign-off pending"
              value={snapshot.apdBasis}
              disabled={pending}
              onChange={(v) => setApdBasis(v as 'booked' | 'available')}
              options={[
                { value: 'available', label: 'Available = booked − holds' },
                { value: 'booked', label: 'Booked balance only' },
              ]}
            />
            <p className="text-xs text-muted-foreground">
              Failed payouts retain their obligation hold in this proposal. Fixture deadlines and
              low-balance thresholds are illustrative. No email, payment or cancellation is sent.
            </p>
            <div className="rounded-lg bg-muted p-3 text-xs">
              <p>
                Snapshot revision {snapshot.revision} · mapping v{snapshot.mappingVersion}
              </p>
              <p className="mt-1 text-muted-foreground">
                Last event: {snapshot.audit.at(-1)?.title || 'Scenario loaded'}
              </p>
            </div>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => void configure(snapshot.topology, scenario)}
            >
              <RotateCcw />
              Reset this scenario
            </Button>
            <Button className="finance-primary" onClick={() => setControls(false)}>
              Explore the portal
              <ChevronRight />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={notifications} onOpenChange={setNotifications}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              Updates for your permitted wallet groups and VANs.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button size="sm" variant="ghost" onClick={markRead}>
              <CheckCheck />
              Mark all read
            </Button>
          </div>
          <div className="max-h-[55vh] space-y-2 overflow-auto">
            {view.notices.length ? (
              view.notices.map((n) => (
                <div
                  className={cn(
                    'rounded-lg border border-border p-4',
                    !n.read && 'bg-icon-select-accent-bg/40',
                  )}
                  key={n.id}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-medium">{n.title}</h3>
                    {!n.read && (
                      <span className="size-2 shrink-0 rounded-full bg-share-policy-primary" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNotifications(false);
                        router.push(`${base}/financials${n.caseId ? '#case/' + n.caseId : ''}`);
                      }}
                    >
                      Review update
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEmailPreview(true)}>
                      Communication preview
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="You’re all caught up"
                description="Relevant funding, payout and case updates will appear here."
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={emailPreview} onOpenChange={setEmailPreview}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle>Communication preview</DialogTitle>
            <DialogDescription>Preview only · no message is sent</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border p-5">
            <p className="text-xs text-muted-foreground">
              TO: Configured finance contact · role-scoped recipients
            </p>
            <h3 className="mt-4 font-semibold">{snapshot.groupName}: financial status update</h3>
            <p className="mt-3 text-sm">
              There is an update requiring review in your Partner Portal. Open the portal to see the
              current status, evidence and next action within your access scope.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Shared-group amounts and co-participant details are excluded from this preview.
              Recipient policy requires confirmation.
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={support} onOpenChange={setSupport}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>Partner support</DialogTitle>
            <DialogDescription>
              This preview covers financial workflows. Policy and claims actions remain in the
              existing connected portal.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
            <ShieldCheck className="size-5 shrink-0" />
            <p className="text-sm">
              For a financial issue, open the affected VAN and raise a dispute. It will include your
              scope, source reference and an audit trail.
            </p>
          </div>
          <Button
            className="finance-primary"
            onClick={() => {
              setSupport(false);
              router.push(`${base}/financials`);
            }}
          >
            Open financials
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

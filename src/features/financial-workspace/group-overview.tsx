'use client';

import { ChevronRight, WalletCards } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeading, PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';
import { money } from './domain';
import { EmptyState } from './common';
import { groupSummary } from './portfolio';
import { useFinancialWorkspace } from './provider';

const statusCopy: Record<string, string> = {
  healthy: 'Issuance active',
  low: 'Balance running low',
  grace: 'Funding needed',
  blocked: 'Issuance paused',
  recovery: 'Manual review needed',
};

export function GroupOverview() {
  const { availableGroups, role, setGroup } = useFinancialWorkspace();
  const items = availableGroups.map((group) => groupSummary(group, role));
  const allVerified = items.length > 0 && items.every((item) => item.available !== null);
  const available = allVerified
    ? items.reduce((total, item) => total + (item.available || 0), 0)
    : null;
  if (!items.length)
    return <EmptyState icon="access" title="No wallet groups assigned" description="Ask your access administrator for wallet group access." />;
  return (
    <div className={`${PAGE_LAYOUT_CLASS} pt-6 pb-10`}>
      <PageHeading
        title="Financials"
        subtitle="Review the wallet groups in your access scope and open one for its VANs, statements and actions."
      />
      <section className="rounded-xl border border-border bg-white p-5" aria-label="All wallet groups summary">
        <p className="text-sm text-muted-foreground">Available across permitted wallet groups</p>
        <p className={`mt-2 text-3xl font-semibold tabular-nums ${available !== null && available < 0 ? 'text-red-600' : ''}`}>
          {available === null ? '—' : money(available)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {items.length} wallet groups · {items.reduce((n, item) => n + item.vanCount, 0)} permitted VANs.
          This is a view total; each wallet group has its own funding and issuance status.
        </p>
        {!allVerified && (
          <p role="status" className="mt-2 text-xs text-amber-700">
            A current source is unavailable for one or more groups, so no combined amount is shown.
          </p>
        )}
      </section>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <section key={item.groupId} className="rounded-xl border border-border bg-white p-5" aria-label={item.name}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-icon-select-accent-bg p-2 text-share-policy-primary"><WalletCards className="size-5" /></div>
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-xs text-muted-foreground">{item.groupId} · {item.vanCount} of {item.totalVanCount} VANs in your access</p>
                </div>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{statusCopy[item.status] || 'Review status'}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-4 text-sm">
              <div><p className="text-muted-foreground">Available in permitted VANs</p><p className={`mt-1 text-xl font-semibold tabular-nums ${item.available !== null && item.available < 0 ? 'text-red-600' : ''}`}>{item.available === null ? '—' : money(item.available)}</p></div>
              <div><p className="text-muted-foreground">Group status</p><p className="mt-1 font-medium">{statusCopy[item.status] || 'Review status'}</p></div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{item.openItems} open financial {item.openItems === 1 ? 'item' : 'items'} · Last fetched {new Date(item.cutoff).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })} IST</span>
              <Button size="sm" variant="outline" onClick={() => setGroup(item.groupId)}>
                Open group <ChevronRight className="size-4" />
              </Button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function GroupSettingsOverview() {
  const { availableGroups, setGroup, view } = useFinancialWorkspace();
  return (
    <div className={`${PAGE_LAYOUT_CLASS} pt-6 pb-10`}>
      <PageHeading title="Settings" subtitle="Choose a wallet group to manage its name and access. Each group keeps its own VAN and partner mappings." />
      <div className="grid grid-cols-2 gap-4">
        {availableGroups.map((group) => (
          <section className="rounded-xl border border-border bg-white p-5" key={group.groupId}>
            <h2 className="font-semibold">{group.groupName}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{group.groupId} · {group.memberVanIds.length} VANs</p>
            <p className="mt-3 text-sm">Partner associations: {[...new Set(group.vans.flatMap((v) => v.plans.map((p) => p.partner)))].join(', ')}</p>
            <p className="mt-1 text-xs text-muted-foreground">{group.users.filter((user) => user.status === 'active' && user.vanIds.length > 0).length} people with financial access in this group</p>
            <Button className="mt-4" variant="outline" onClick={() => setGroup(group.groupId)}>Open group settings <ChevronRight className="size-4" /></Button>
          </section>
        ))}
      </div>
      {!view.actor.capabilities.includes('manage-access') && <p className="text-sm text-muted-foreground">Your administrator controls group membership and VAN grants.</p>}
    </div>
  );
}

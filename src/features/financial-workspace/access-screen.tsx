'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PageHeading, PAGE_LAYOUT_CLASS } from '@/components/molecules/PageHeading';
import DataTable from '@/components/molecules/DataTable';
import { EmptyState, Picker, StatusPill } from './common';
import { useFinancialWorkspace } from './provider';
import type { AccessUser, Capability } from './domain';
const PERMISSION_LABELS: Partial<Record<Capability, string>> = {
  view: 'View balances and statements',
  export: 'Download statements',
  dispute: 'Raise disputes',
  'manage-access': 'Manage users within granted scope',
};
export function AccessManagement() {
  const { snapshot, view, execute, pending, error, clearError, unknownOutcome, checkOutcome } =
    useFinancialWorkspace();
  const { partner } = useParams<{ partner: string }>();
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<AccessUser | null>(null);
  const [reason, setReason] = useState('');
  const [review, setReview] = useState(false);
  const canManage = view.actor.capabilities.includes('manage-access');
  const users = snapshot.users.filter(
    (u) =>
      !['reconciliation', 'approver', 'account-manager'].includes(u.id) &&
      (!search || `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())),
  );
  const toggle = (field: 'vanIds' | 'planIds' | 'capabilities', id: string, on: boolean) =>
    setDraft((d) =>
      d ? { ...d, [field]: on ? [...d[field], id] : d[field].filter((v) => v !== id) } : d,
    );
  const edit = (user: AccessUser) => {
    clearError();
    setDraft(structuredClone(user));
    setReview(false);
    setReason('');
  };
  return (
    <div className={`${PAGE_LAYOUT_CLASS} pt-6 pb-10`}>
      <PageHeading
        title="Settings"
        subtitle="Manage people and their independent operational and financial access."
      />
      <nav className="flex gap-6 border-b border-border pb-3 text-sm">
        <strong className="text-share-policy-primary">Access management</strong>
        <Link href={`/${partner}/dashboard/settings/configure-metrics`}>Configure metrics</Link>
      </nav>
      {!canManage ? (
        <EmptyState
          title="User administration is not in your role"
          description="Ask your partner super admin to update access. Finance actions and user administration are separate permissions."
          icon="access"
        />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 text-sm">
            {[
              ['Financial access', 'Wallet group → specific VANs → view, export or dispute.'],
              ['Operational access', 'Specific plans → policy, claims and manual refund records.'],
              [
                'Administration',
                'Grant only your own scope. A different admin must change your access.',
              ],
            ].map(([title, body]) => (
              <div className="rounded-lg border border-border p-4" key={title}>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between gap-3">
            <Input
              placeholder="Search people"
              aria-label="Search people"
              className="max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              className="finance-primary"
              onClick={() =>
                edit({
                  id: `user-${snapshot.revision}`,
                  name: '',
                  email: '',
                  status: 'active',
                  vanIds: [],
                  planIds: [],
                  capabilities: [],
                })
              }
            >
              Invite user
            </Button>
          </div>
          <DataTable<AccessUser>
            data={users}
            getRowId={(u) => u.id}
            columns={[
              {
                id: 'name',
                header: 'USER',
                cell: (u) => (
                  <span className="font-medium">
                    {u.name}
                    <small className="block font-normal text-muted-foreground">{u.email}</small>
                  </span>
                ),
              },
              {
                id: 'vans',
                header: 'FINANCIAL ACCOUNTS',
                cell: (u) => <span>{u.vanIds.join(', ') || 'None'}</span>,
              },
              {
                id: 'plans',
                header: 'OPERATIONAL PLANS',
                cell: (u) => <span>{u.planIds.length} plans</span>,
              },
              {
                id: 'capabilities',
                header: 'PERMISSIONS',
                cell: (u) => (
                  <span>
                    {u.capabilities.filter((c) => PERMISSION_LABELS[c]).join(', ') ||
                      'Operational only'}
                  </span>
                ),
              },
              { id: 'status', header: 'STATUS', cell: (u) => <StatusPill status={u.status} /> },
              {
                id: 'edit',
                header: 'ACTION',
                cell: (u) => (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={u.id === view.actor.id}
                    onClick={() => edit(u)}
                  >
                    {u.id === view.actor.id ? 'Your account' : 'Edit access'}
                  </Button>
                ),
              },
            ]}
          />
          <section className="rounded-lg border border-border p-4">
            <h2 className="text-sm font-semibold">Recent access changes</h2>
            {snapshot.audit.filter((a) => /User|invited/.test(a.title)).length ? (
              snapshot.audit
                .filter((a) => /User|invited/.test(a.title))
                .map((a) => (
                  <p className="mt-2 text-sm" key={a.id}>
                    {a.title} · {a.detail} · {a.actor}
                  </p>
                ))
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No changes in this session.</p>
            )}
          </section>
        </>
      )}
      {draft && (
        <Dialog
          open
          onOpenChange={(v) => {
            if (!v && !pending) setDraft(null);
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto bg-white">
            <DialogHeader>
              <DialogTitle>{review ? 'Review access changes' : 'User access'}</DialogTitle>
              <DialogDescription>
                {snapshot.groupName} · Financial and operational grants are independent.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!review) {
                  setReview(true);
                  return;
                }
                if (await execute({ type: 'manage-access', user: draft, reason })) {
                  setDraft(null);
                  setReview(false);
                }
              }}
            >
              {review ? (
                <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
                  <p>
                    {draft.name} · {draft.email}
                  </p>
                  <p>Status: {draft.status}</p>
                  <p>VANs: {draft.vanIds.join(', ') || 'None'}</p>
                  <p>Plans: {draft.planIds.join(', ') || 'None'}</p>
                  <p>Permissions: {draft.capabilities.join(', ') || 'None'}</p>
                  <p>
                    {draft.status === 'inactive'
                      ? 'All grants will stop applying immediately in this simulator.'
                      : 'Only the checked scopes will be granted.'}
                  </p>
                  <p>Reason: {reason}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="text-sm">
                      Full name
                      <Input
                        required
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      />
                    </label>
                    <label className="text-sm">
                      Email
                      <Input
                        required
                        type="email"
                        value={draft.email}
                        onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                      />
                    </label>
                  </div>
                  <Picker
                    label="Account status"
                    value={draft.status}
                    onChange={(v) => setDraft({ ...draft, status: v as 'active' | 'inactive' })}
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Deactivate access' },
                    ]}
                  />
                  <fieldset className="rounded-lg border border-border p-4 space-y-3">
                    <legend className="px-2 text-sm font-semibold">Financial VANs</legend>
                    {snapshot.vans
                      .filter((v) => view.actor.vanIds.includes(v.id))
                      .map((v) => (
                        <label key={v.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={draft.vanIds.includes(v.id)}
                            onCheckedChange={(on) => toggle('vanIds', v.id, on === true)}
                          />
                          {v.id} · {v.label}
                        </label>
                      ))}
                  </fieldset>
                  <fieldset className="rounded-lg border border-border p-4 space-y-3">
                    <legend className="px-2 text-sm font-semibold">Permissions</legend>
                    {Object.entries(PERMISSION_LABELS)
                      .filter(([c]) => view.actor.capabilities.includes(c as Capability))
                      .map(([c, label]) => (
                        <label key={c} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={draft.capabilities.includes(c as Capability)}
                            onCheckedChange={(on) => toggle('capabilities', c, on === true)}
                          />
                          {label}
                        </label>
                      ))}
                  </fieldset>
                  <fieldset className="rounded-lg border border-border p-4 space-y-3">
                    <legend className="px-2 text-sm font-semibold">Operational plans</legend>
                    {view.ownPlans.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={draft.planIds.includes(p.id)}
                          onCheckedChange={(on) => toggle('planIds', p.id, on === true)}
                        />
                        {p.partner} · {p.name}
                      </label>
                    ))}
                  </fieldset>
                  <label className="block text-sm">
                    Reason for change
                    <Input
                      required
                      minLength={8}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </label>
                </>
              )}
              {error && (
                <p role="alert" className="finance-danger p-3 rounded-lg text-sm">
                  {error}
                </p>
              )}
              <div>
                {unknownOutcome && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      checkOutcome();
                      setDraft(null);
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
                  onClick={() => (review ? setReview(false) : setDraft(null))}
                >
                  {review ? 'Back' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={pending}>
                  {unknownOutcome
                    ? 'Awaiting confirmation'
                    : pending
                      ? 'Saving…'
                      : review
                        ? 'Confirm access'
                        : 'Review changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

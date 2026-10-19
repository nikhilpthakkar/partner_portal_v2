/** Pure reference model. All amounts are integer paise; fixtures are synthetic. */
export type Topology = 'eternal' | 'cred';
export type Role =
  | 'partner-finance'
  | 'eternal-group-finance'
  | 'partner-viewer'
  | 'partner-ops'
  | 'credit-vidya'
  | 'reconciliation'
  | 'approver';
export type Scenario =
  | 'healthy'
  | 'low'
  | 'grace'
  | 'blocked'
  | 'recovery'
  | 'refund-pending'
  | 'refund-failed'
  | 'unmatched'
  | 'mismatch'
  | 'stale'
  | 'empty'
  | 'error'
  | 'loading'
  | 'no-access';
export type ApdState = 'healthy' | 'low' | 'grace' | 'blocked' | 'recovery';
export type DataState = 'ready' | 'stale' | 'empty' | 'error' | 'loading' | 'no-access';
export type Capability =
  | 'view'
  | 'export'
  | 'report-deposit'
  | 'dispute'
  | 'match'
  | 'retry'
  | 'correct'
  | 'approve'
  | 'mapping'
  | 'resolve';
export type CaseKind = 'deposit' | 'refund' | 'dispute' | 'correction' | 'mapping';
export type CaseStatus =
  | 'open'
  | 'pending'
  | 'failed'
  | 'approved'
  | 'rejected'
  | 'resolved'
  | 'paid'
  | 'awaiting-activation';
export interface Plan {
  id: string;
  name: string;
  partner: string;
}
export interface Van {
  id: string;
  label: string;
  maskedAccount: string;
  plans: Plan[];
  opening: number;
}
export interface Movement {
  id: string;
  vanId: string;
  planId?: string;
  kind: 'deposit' | 'premium' | 'refund-credit' | 'payout' | 'adjustment';
  amount: number;
  description: string;
  source: string;
  postedAt: string;
  mappingVersion?: number;
  corrects?: string;
}
export interface AuditEvent {
  id: string;
  actor: string;
  title: string;
  detail: string;
  at: string;
}
export interface FinanceCase {
  id: string;
  vanId: string;
  kind: CaseKind;
  title: string;
  status: CaseStatus;
  amount: number;
  reference: string;
  reason: string;
  maker: string;
  owner: string;
  events: AuditEvent[];
  targetVanId?: string;
}
export interface Notice {
  id: string;
  title: string;
  body: string;
  caseId?: string;
  read: boolean;
  channel: 'In-app';
}
export interface Snapshot {
  topology: Topology;
  groupId: string;
  groupName: string;
  mappingVersion: number;
  memberVanIds: string[];
  vans: Van[];
  movements: Movement[];
  cases: FinanceCase[];
  notices: Notice[];
  audit: AuditEvent[];
  apd: ApdState;
  dataState: DataState;
  reconciliation: 'matched' | 'mismatch';
  cutoff: string;
  revision: number;
  appliedKeys: string[];
  apdBasis: 'booked' | 'available';
}
export interface Actor {
  id: string;
  label: string;
  internal: boolean;
  partnerIds: string[];
  vanIds: string[];
  capabilities: Capability[];
}
export interface VanBalance {
  van: Van;
  booked: number;
  held: number;
  available: number;
}
export interface WorkspaceView {
  actor: Actor;
  balances: VanBalance[];
  movements: Movement[];
  cases: FinanceCase[];
  notices: Notice[];
  ownPlans: Plan[];
  visibleTotal: number | null;
  groupTotal: number | null;
  groupApdAmount: number | null;
}
export type Command =
  | { type: 'report-deposit'; vanId: string; amount: number; reference: string; reason: string }
  | { type: 'dispute'; vanId: string; reference: string; reason: string }
  | { type: 'match' | 'retry' | 'approve' | 'reject' | 'resolve'; caseId: string; reason: string }
  | { type: 'correct'; vanId: string; amount: number; reference: string; reason: string }
  | { type: 'mapping'; vanId: string; reason: string };
export type SystemEvent =
  | 'expire-grace'
  | 'expire-recovery'
  | 'payout-success'
  | 'payout-failure'
  | 'refresh';

export const ROLE_LABELS: Record<Role, string> = {
  'partner-finance': 'Partner finance · actions',
  'eternal-group-finance': 'Eternal group finance · 4 VANs (example grant)',
  'partner-viewer': 'Partner finance · view only',
  'partner-ops': 'Partner operations',
  'credit-vidya': 'Credit Vidya finance',
  reconciliation: 'ACKO reconciliation',
  approver: 'ACKO Finance approver',
};
export const SCENARIOS: Record<Scenario, string> = {
  healthy: 'Healthy wallet group',
  low: 'Low available balance',
  grace: 'APD grace period',
  blocked: 'Issuance blocked',
  recovery: 'Recovery expired · manual review',
  'refund-pending': 'Bank refund pending',
  'refund-failed': 'Bank refund failed',
  unmatched: 'Unmatched deposit',
  mismatch: 'Reconciliation mismatch',
  stale: 'Delayed source data',
  empty: 'New account · no activity',
  error: 'Request failed',
  loading: 'Loading response',
  'no-access': 'Access removed',
};
export const money = (paise: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);
const rs = (value: number) => value * 100;
const timestamp = '2026-10-17T05:12:00.000Z';
const plan = (id: string, name: string, partner: string): Plan => ({ id, name, partner });
const audit = (id: string, actor: string, title: string, detail: string): AuditEvent => ({
  id,
  actor,
  title,
  detail,
  at: timestamp,
});

export function createSnapshot(
  topology: Topology = 'eternal',
  scenario: Scenario = 'healthy',
): Snapshot {
  const vans: Van[] =
    topology === 'eternal'
      ? [
          {
            id: 'VAN-1',
            label: 'Zomato Gig',
            maskedAccount: '•••• 1041',
            opening: rs(800000),
            plans: [
              plan('gig-1', 'Zomato Gig Plan 1', 'Zomato'),
              plan('gig-2', 'Zomato Gig Plan 2', 'Zomato'),
            ],
          },
          {
            id: 'VAN-2',
            label: 'Blinkit',
            maskedAccount: '•••• 1042',
            opening: rs(-90000),
            plans: [plan('blinkit-3', 'Blinkit Plan 3', 'Blinkit')],
          },
          {
            id: 'VAN-3',
            label: 'District',
            maskedAccount: '•••• 1043',
            opening: rs(500000),
            plans: [plan('district-4', 'District Plan 4', 'District')],
          },
          {
            id: 'VAN-4',
            label: 'Hyperpure',
            maskedAccount: '•••• 1044',
            opening: rs(200000),
            plans: [plan('hyperpure-5', 'Hyperpure Plan 5', 'Hyperpure')],
          },
        ]
      : [
          {
            id: 'VAN-1',
            label: 'Cred Loan Shield',
            maskedAccount: '•••• 2031',
            opening: rs(500000),
            plans: [plan('cred_loanshield', 'Cred Loan Shield', 'Cred')],
          },
          {
            id: 'VAN-2',
            label: 'Cred + Credit Vidya',
            maskedAccount: '•••• 2032',
            opening: rs(200000),
            plans: [
              plan('cred_home', 'Cred Home', 'Cred'),
              plan('Cred_vs', 'Credit Vidya VS', 'Credit Vidya'),
            ],
          },
        ];
  const movements: Movement[] = [];
  for (const [index, van] of vans.entries()) {
    for (const [pIndex, p] of van.plans.entries())
      movements.push({
        id: `MOV-${index}-${pIndex}`,
        vanId: van.id,
        planId: p.id,
        kind: 'premium',
        amount: -rs(
          topology === 'cred' && index === 0
            ? 100000
            : pIndex === 1
              ? 20000
              : index === 2
                ? 40000
                : index === 3
                  ? 10000
                  : 30000,
        ),
        description: `Premium · ${p.name}`,
        source: `DEMO-FA-${index}${pIndex}17`,
        postedAt: timestamp,
      });
  }
  const depositVan = topology === 'eternal' ? 'VAN-1' : 'VAN-2';
  movements.unshift({
    id: 'MOV-DEP-1',
    vanId: depositVan,
    kind: 'deposit',
    amount: rs(100000),
    description: 'Bank transfer received',
    source: 'DEMO-UTR-17001',
    postedAt: timestamp,
  });
  const s: Snapshot = {
    topology,
    groupId: topology === 'eternal' ? 'WG-ETERNAL' : 'WG-CRED',
    groupName: topology === 'eternal' ? 'Eternal' : 'Cred',
    vans,
    memberVanIds: vans.map((v) => v.id),
    mappingVersion: 1,
    movements,
    cases: [],
    notices: [],
    audit: [],
    apd: 'healthy',
    dataState: 'ready',
    reconciliation: 'matched',
    cutoff: timestamp,
    revision: 1,
    appliedKeys: [],
    apdBasis: 'available',
  };
  if (['grace', 'blocked', 'recovery', 'low'].includes(scenario)) {
    const targets =
      scenario === 'low'
        ? topology === 'eternal'
          ? [50000, -60000, 25000, 10000]
          : [50000, -25000]
        : topology === 'eternal'
          ? [100000, -390000, 90000, 50000]
          : [50000, -180000];
    vans.forEach((v, i) => {
      const delta = rs(targets[i]) - balance(s, v.id).booked;
      s.movements.push({
        id: `MOV-SCENARIO-${i}`,
        vanId: v.id,
        kind: delta >= 0 ? 'deposit' : 'premium',
        amount: delta,
        description: delta >= 0 ? 'Additional funding' : 'Additional premium batch',
        source: `DEMO-BATCH-${i}17`,
        postedAt: timestamp,
      });
    });
    s.apd = scenario as ApdState;
  }
  if (scenario.startsWith('refund')) {
    s.movements.push({
      id: 'MOV-CANCEL',
      vanId: depositVan,
      planId: vans.find((v) => v.id === depositVan)!.plans[0].id,
      kind: 'refund-credit',
      amount: rs(5000),
      description: 'Cancellation credit · bank refund',
      source: 'DEMO-CAN-1042',
      postedAt: timestamp,
    });
    s.cases.push({
      id: 'CASE-1042',
      vanId: depositVan,
      kind: 'refund',
      title: 'Bank refund · cancellation',
      status: scenario === 'refund-failed' ? 'failed' : 'pending',
      amount: rs(5000),
      reference: 'DEMO-PAYOUT-1042',
      reason:
        scenario === 'refund-failed'
          ? 'Bank rejected the beneficiary account. Verify the destination before retrying.'
          : 'Cancellation recorded. Awaiting the bank settlement response.',
      maker: 'source-system',
      owner: 'ACKO payout operations',
      events: [
        audit(
          'EV-1042',
          'FinAcko',
          'Cancellation recorded',
          'Credit posted and payout obligation held.',
        ),
        audit(
          'EV-1043',
          'Payout provider',
          scenario === 'refund-failed' ? 'Payout failed' : 'Payout pending',
          'No settled bank debit recorded.',
        ),
      ],
    });
  }
  if (scenario === 'unmatched')
    s.cases.push({
      id: 'CASE-DEP-100',
      vanId: depositVan,
      kind: 'deposit',
      title: 'Deposit awaiting bank match',
      status: 'pending',
      amount: rs(200000),
      reference: 'DEMO-UTR-UNMATCHED',
      reason: 'A bank credit is awaiting reconciliation with this VAN.',
      maker: 'source-system',
      owner: 'ACKO reconciliation',
      events: [
        audit(
          'EV-DEP',
          'Bank feed',
          'Credit awaiting match',
          'Balance unchanged until verified matching.',
        ),
      ],
    });
  if (scenario === 'mismatch') s.reconciliation = 'mismatch';
  if (['stale', 'empty', 'error', 'loading', 'no-access'].includes(scenario))
    s.dataState = scenario as DataState;
  if (scenario === 'empty') {
    s.movements = [];
    s.vans = vans.map((v) => ({ ...v, opening: 0 }));
  }
  if (scenario === 'stale') s.cutoff = '2026-10-16T05:12:00.000Z';
  if (s.apd !== 'healthy')
    s.notices.push({
      id: 'NOTICE-APD',
      title:
        s.apd === 'grace'
          ? 'Wallet group entered grace'
          : s.apd === 'low'
            ? 'Funding review recommended'
            : 'Issuance is blocked',
      body: `Review the ${s.groupName} wallet group status and funding deadline.`,
      read: false,
      channel: 'In-app',
    });
  for (const c of s.cases)
    s.notices.push({
      id: `NOTICE-${c.id}`,
      title: c.title,
      body: c.reason,
      caseId: c.id,
      read: false,
      channel: 'In-app',
    });
  s.movements = s.movements.map((m) => ({ ...m, mappingVersion: 1 }));
  return s;
}

export function actorFor(s: Snapshot, role: Role): Actor {
  const internal = role === 'reconciliation' || role === 'approver';
  const groupFinance = role === 'eternal-group-finance' && s.topology === 'eternal';
  const partnerIds =
    internal || groupFinance
      ? [...new Set(s.vans.flatMap((v) => v.plans.map((p) => p.partner)))]
      : role === 'credit-vidya'
        ? ['Credit Vidya']
        : [s.topology === 'eternal' ? 'Zomato' : 'Cred'];
  const vanIds =
    role === 'partner-ops' || s.dataState === 'no-access'
      ? []
      : s.vans
          .filter(
            (v) => internal || groupFinance || v.plans.some((p) => partnerIds.includes(p.partner)),
          )
          .map((v) => v.id);
  const capabilities: Capability[] = role === 'partner-ops' ? [] : ['view', 'export'];
  if (!['partner-ops', 'partner-viewer', 'eternal-group-finance'].includes(role))
    capabilities.push('dispute', 'report-deposit');
  if (groupFinance) capabilities.push('dispute');
  if (role === 'reconciliation')
    capabilities.push('match', 'retry', 'correct', 'mapping', 'resolve');
  if (role === 'approver') capabilities.push('approve');
  return {
    id: role,
    label: ROLE_LABELS[role],
    internal,
    partnerIds,
    vanIds,
    capabilities: s.dataState === 'no-access' ? [] : capabilities,
  };
}

export function balance(s: Snapshot, vanId: string): VanBalance {
  const van = s.vans.find((v) => v.id === vanId);
  if (!van) throw new Error('VAN not found.');
  const booked =
    van.opening + s.movements.filter((m) => m.vanId === vanId).reduce((n, m) => n + m.amount, 0);
  const held = s.cases
    .filter(
      (c) => c.vanId === vanId && c.kind === 'refund' && ['pending', 'failed'].includes(c.status),
    )
    .reduce((n, c) => n + c.amount, 0);
  return { van, booked, held, available: booked - held };
}
export function apdAmount(s: Snapshot): number {
  return [...new Set(s.memberVanIds)].reduce((n, id) => n + balance(s, id)[s.apdBasis], 0);
}
export function selectView(s: Snapshot, role: Role): WorkspaceView {
  const actor = actorFor(s, role);
  const canRead =
    actor.capabilities.includes('view') && !['error', 'loading', 'no-access'].includes(s.dataState);
  const balances = canRead
    ? s.vans.filter((v) => actor.vanIds.includes(v.id)).map((v) => balance(s, v.id))
    : [];
  const ownPlans =
    s.dataState === 'no-access'
      ? []
      : s.vans.flatMap((v) => v.plans.filter((p) => actor.partnerIds.includes(p.partner)));
  const ownIds = new Set(ownPlans.map((p) => p.id));
  const movements = canRead
    ? s.movements
        .filter((m) => actor.vanIds.includes(m.vanId))
        .map((m) =>
          m.planId && !ownIds.has(m.planId)
            ? {
                ...m,
                planId: undefined,
                source: 'Restricted attribution',
                description: 'Co-participant movement',
              }
            : m,
        )
    : [];
  const cases = canRead
    ? s.cases
        .filter((c) => actor.vanIds.includes(c.vanId))
        .map((c) => {
          const credit = s.movements.find((m) => m.vanId === c.vanId && m.kind === 'refund-credit');
          return c.kind === 'refund' && credit?.planId && !ownIds.has(credit.planId)
            ? {
                ...c,
                reference: 'Restricted attribution',
                reason: 'A co-participant payout affects this shared VAN.',
                events: [],
              }
            : c;
        })
    : [];
  const caseIds = new Set(cases.map((c) => c.id));
  const notices =
    s.dataState === 'no-access'
      ? []
      : s.notices
          .filter((n) => !n.caseId || caseIds.has(n.caseId))
          .map((n) =>
            n.caseId ? { ...n, body: cases.find((c) => c.id === n.caseId)?.reason || n.body } : n,
          );
  return {
    actor,
    balances,
    ownPlans,
    movements,
    cases,
    notices,
    visibleTotal:
      canRead && s.dataState !== 'empty' ? balances.reduce((n, b) => n + b.booked, 0) : null,
    groupTotal:
      canRead && actor.internal && s.dataState !== 'empty'
        ? s.vans
            .filter((v) => s.memberVanIds.includes(v.id))
            .reduce((n, v) => n + balance(s, v.id).booked, 0)
        : null,
    groupApdAmount: canRead && actor.internal && s.dataState !== 'empty' ? apdAmount(s) : null,
  };
}

function reconcileApd(s: Snapshot) {
  if (apdAmount(s) >= 0) s.apd = apdAmount(s) < rs(100000) ? 'low' : 'healthy';
  else if (s.apd === 'healthy' || s.apd === 'low') s.apd = 'grace';
}
export function changeApdBasis(current: Snapshot, basis: Snapshot['apdBasis']): Snapshot {
  const s = structuredClone(current);
  s.apdBasis = basis;
  return finish(
    s,
    'Policy simulator',
    'APD basis changed',
    `Illustrative calculation now uses ${basis} balance.`,
  );
}
function finish(s: Snapshot, actor: string, title: string, detail: string, caseId?: string) {
  s.revision += 1;
  s.audit.push(audit(`AUD-${s.revision}`, actor, title, detail));
  s.notices.unshift({
    id: `NOTICE-${s.revision}`,
    title,
    body: detail,
    caseId,
    read: false,
    channel: 'In-app',
  });
  reconcileApd(s);
  return s;
}

export function executeCommand(
  current: Snapshot,
  role: Role,
  command: Command,
  idempotencyKey: string,
): Snapshot {
  const actor = actorFor(current, role);
  if (!actor.capabilities.includes(command.type === 'reject' ? 'approve' : command.type))
    throw new Error('Your role does not allow this action. Contact your access administrator.');
  if (current.appliedKeys.includes(idempotencyKey)) return current;
  if (
    (current.dataState !== 'ready' || current.reconciliation !== 'matched') &&
    command.type !== 'dispute'
  )
    throw new Error('Current source data is required before this action can be completed.');
  if (command.reason.trim().length < 8) throw new Error('Add a reason with at least 8 characters.');
  const s = structuredClone(current);
  const c = 'caseId' in command ? s.cases.find((c) => c.id === command.caseId) : undefined;
  const vanId = 'vanId' in command ? command.vanId : c?.vanId;
  if (!vanId || !actor.vanIds.includes(vanId))
    throw new Error('This VAN is outside your financial grant.');
  if (
    'amount' in command &&
    (!Number.isSafeInteger(command.amount) ||
      command.amount === 0 ||
      Math.abs(command.amount) > rs(1000000000))
  )
    throw new Error('Enter a valid amount, with at most two decimal places.');
  if (command.type === 'report-deposit' && command.amount <= 0)
    throw new Error('Deposit amount must be positive.');
  if ('reference' in command && command.reference.trim().length < 4)
    throw new Error('Add the bank UTR or source reference.');
  if (
    command.type === 'correct' &&
    !s.movements.some((m) => m.vanId === vanId && m.source === command.reference.trim())
  )
    throw new Error('Use an existing source reference from this VAN’s statement.');
  if (
    command.type === 'report-deposit' &&
    [
      ...s.movements.map((m) => m.source),
      ...s.cases.filter((c) => c.kind === 'deposit').map((c) => c.reference),
    ].some((r) => r.toLowerCase() === command.reference.trim().toLowerCase())
  )
    throw new Error('This UTR is already recorded. Open the existing transfer instead.');
  const caseId = `CASE-${s.revision + 2000}`;
  let title = '';
  if (
    command.type === 'report-deposit' ||
    command.type === 'dispute' ||
    command.type === 'correct' ||
    command.type === 'mapping'
  ) {
    if (
      command.type === 'mapping' &&
      (!s.memberVanIds.includes(vanId) || s.memberVanIds.length < 2)
    )
      throw new Error('This VAN cannot be removed from the current group.');
    if (
      command.type === 'mapping' &&
      s.cases.some(
        (c) =>
          c.kind === 'mapping' &&
          c.vanId === vanId &&
          ['pending', 'awaiting-activation'].includes(c.status),
      )
    )
      throw new Error('A mapping request already exists for this VAN. Review the existing case.');
    const kind: CaseKind =
      command.type === 'report-deposit'
        ? 'deposit'
        : command.type === 'correct'
          ? 'correction'
          : command.type;
    title = {
      deposit: 'Deposit reported',
      dispute: 'Dispute raised',
      correction: 'Correction awaiting approval',
      mapping: 'Mapping change awaiting approval',
      refund: '',
    }[kind];
    s.cases.unshift({
      id: caseId,
      kind,
      vanId,
      title,
      amount: 'amount' in command ? command.amount : 0,
      reference: 'reference' in command ? command.reference.trim() : `MAP-V${s.mappingVersion}`,
      reason: command.reason.trim(),
      status: kind === 'dispute' ? 'open' : 'pending',
      maker: actor.id,
      owner:
        kind === 'correction' || kind === 'mapping'
          ? 'ACKO Finance approver'
          : 'ACKO reconciliation',
      events: [audit(`EV-${s.revision}`, actor.label, title, command.reason)],
      targetVanId: command.type === 'mapping' ? vanId : undefined,
    });
  } else {
    if (!c) throw new Error('The case was not found. Refresh and try again.');
    if (command.type === 'match') {
      if (c.kind !== 'deposit' || c.status !== 'pending')
        throw new Error('Only a pending deposit can be matched.');
      if (s.movements.some((m) => m.source.toLowerCase() === c.reference.toLowerCase()))
        throw new Error('The bank reference has already been credited.');
      s.movements.push({
        id: `MOV-${s.revision}`,
        vanId,
        kind: 'deposit',
        amount: c.amount,
        description: 'Verified bank deposit',
        source: c.reference,
        postedAt: timestamp,
        mappingVersion: s.mappingVersion,
      });
      c.status = 'resolved';
      title = 'Deposit matched and credited';
    } else if (command.type === 'retry') {
      if (c.kind !== 'refund' || c.status !== 'failed')
        throw new Error('Only a failed payout can be retried.');
      c.status = 'pending';
      title = 'Payout retry submitted';
    } else if (command.type === 'resolve') {
      if (c.kind !== 'dispute' || c.status !== 'open')
        throw new Error('Only an open dispute can be resolved.');
      c.status = 'resolved';
      title = 'Dispute resolved';
    } else {
      if (!['correction', 'mapping'].includes(c.kind) || c.status !== 'pending')
        throw new Error('This case is not awaiting approval.');
      if (c.maker === actor.id)
        throw new Error('A different authorized person must approve this request.');
      if (command.type === 'reject') {
        c.status = 'rejected';
        title = 'Request rejected';
      } else if (c.kind === 'correction') {
        s.movements.push({
          id: `MOV-${s.revision}`,
          vanId,
          kind: 'adjustment',
          amount: c.amount,
          description: 'Approved correction',
          source: `ADJUSTMENT-${c.id}`,
          postedAt: timestamp,
          mappingVersion: s.mappingVersion,
          corrects: c.reference,
        });
        c.status = 'approved';
        title = 'Correction approved and posted';
      } else {
        if (!s.memberVanIds.includes(vanId) || s.memberVanIds.length < 2)
          throw new Error('Mapping changed since this request. Review again.');
        c.status = 'awaiting-activation';
        c.owner = 'ACKO configuration operations';
        title = 'Mapping approved · activation pending';
      }
    }
    c.title = title;
    c.events.push(audit(`EV-${s.revision}`, actor.label, title, command.reason));
  }
  s.appliedKeys.push(idempotencyKey);
  return finish(s, actor.label, title, command.reason, c?.id || caseId);
}

/** These are simulated external events, never partner-facing financial actions. */
export function applySystemEvent(current: Snapshot, event: SystemEvent): Snapshot {
  const s = structuredClone(current);
  if (event === 'refresh') {
    s.dataState = 'ready';
    s.reconciliation = 'matched';
    s.cutoff = timestamp;
    return finish(s, 'Source simulator', 'Sources refreshed', 'Verified snapshot is available.');
  }
  if (event === 'expire-grace') {
    if (s.apd !== 'grace' || apdAmount(s) >= 0)
      throw new Error('A negative wallet group in grace is required.');
    s.apd = 'blocked';
    return finish(
      s,
      'APD service',
      'Grace expired · issuance blocked',
      'All mapped plans are blocked for new issuance. Failed attempts will not replay automatically.',
    );
  }
  if (event === 'expire-recovery') {
    if (s.apd !== 'blocked')
      throw new Error('Issuance must be blocked before recovery can expire.');
    s.apd = 'recovery';
    return finish(
      s,
      'APD service',
      'Recovery expired · manual review',
      'Finance and Business must review affected policies and claims exceptions. No automatic cancellation.',
    );
  }
  const c = s.cases.find((c) => c.kind === 'refund' && c.status === 'pending');
  if (!c) throw new Error('No pending payout is available for a bank response.');
  c.status = event === 'payout-success' ? 'paid' : 'failed';
  if (event === 'payout-success')
    s.movements.push({
      id: `MOV-PAYOUT-${c.id}`,
      vanId: c.vanId,
      kind: 'payout',
      amount: -c.amount,
      description: 'Bank refund settled',
      source: c.reference,
      postedAt: timestamp,
      mappingVersion: s.mappingVersion,
    });
  const title = event === 'payout-success' ? 'Bank refund settled' : 'Bank payout failed';
  c.title = title;
  c.events.push(
    audit(
      `EV-${s.revision}`,
      'Payout provider',
      title,
      'Bank response received for the existing obligation.',
    ),
  );
  return finish(
    s,
    'Payout provider',
    title,
    event === 'payout-success'
      ? 'Settlement recorded and the hold released.'
      : 'No bank debit posted. The obligation remains held for investigation.',
    c.id,
  );
}

export function exportStatement(s: Snapshot, role: Role, vanId: string): string {
  return exportStatements(s, role, [vanId]);
}

export function exportStatements(s: Snapshot, role: Role, vanIds: string[]): string {
  const view = selectView(s, role);
  if (
    !view.actor.capabilities.includes('export') ||
    vanIds.length === 0 ||
    vanIds.some((id) => !view.actor.vanIds.includes(id)) ||
    ['error', 'loading', 'no-access', 'empty'].includes(s.dataState)
  )
    throw new Error('Statement export is unavailable for this scope.');
  const cell = (value: string | number) =>
    `"${String(value)
      .replace(/^[=+@\t\r]/, "'")
      .replaceAll('"', '""')}"`;
  const rows = [
    ['VAN', 'Description', 'Source', 'Amount INR', 'Cutoff', 'Mapping version'],
    ...vanIds.flatMap((vanId) => {
      const b = view.balances.find((item) => item.van.id === vanId)!;
      return [
        [vanId, 'Opening balance', '', (b.van.opening / 100).toFixed(2), s.cutoff, 1],
        ...view.movements
          .filter((m) => m.vanId === vanId)
          .map((m) => [
            vanId,
            m.description,
            m.source,
            (m.amount / 100).toFixed(2),
            s.cutoff,
            m.mappingVersion ?? 1,
          ]),
        [
          vanId,
          'Closing booked balance',
          '',
          (b.booked / 100).toFixed(2),
          s.cutoff,
          s.mappingVersion,
        ],
      ];
    }),
  ];
  return rows.map((row) => row.map(cell).join(',')).join('\r\n');
}

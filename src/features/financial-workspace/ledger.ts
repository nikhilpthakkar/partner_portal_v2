import type { Movement, WorkspaceView } from './domain';

export type AggregateBy = 'Day' | 'Week' | 'Month' | 'Quarter';
export interface LedgerRow {
  id: string;
  vanId: string;
  vanLabel: string;
  period: string;
  periodKey: string;
  opening: number;
  deposits: number;
  premium: number;
  accountRefund: number;
  floatRefund: number;
  bankRefundCredit: number;
  depositAdjustment: number;
  premiumAdjustment: number;
  depositRefund: number;
  tcs: number;
  tds: number;
  utrs: string[];
  closing: number;
  held: number;
  available: number;
  movementIds: string[];
}
export const ledgerDay = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));
function periodFor(iso: string, by: AggregateBy) {
  const date = ledgerDay(iso),
    [year, month] = date.split('-').map(Number);
  if (by === 'Day')
    return {
      key: date,
      label: new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    };
  if (by === 'Week') {
    const monday = new Date(`${date}T00:00:00Z`);
    monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    return { key, label: `Week of ${key}` };
  }
  if (by === 'Month')
    return {
      key: `${year}-${String(month).padStart(2, '0')}`,
      label: new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    };
  const q = Math.floor((month - 1) / 3) + 1;
  return { key: `${year}-Q${q}`, label: `Q${q} ${year}` };
}
function heldAt(view: WorkspaceView, vanId: string, day: string) {
  const bank = view.cases
    .filter(
      (c) =>
        c.vanId === vanId &&
        c.kind === 'refund' &&
        c.destination !== 'float' &&
        (!c.createdAt || ledgerDay(c.createdAt) <= day) &&
        (!c.completedAt || ledgerDay(c.completedAt) > day) &&
        ['pending', 'failed', 'paid'].includes(c.status),
    )
    .reduce((n, c) => n + c.amount, 0);
  return (
    bank +
    view.holds
      .filter(
        (h) =>
          h.vanId === vanId &&
          ledgerDay(h.createdAt) <= day &&
          (!h.releasedAt || ledgerDay(h.releasedAt) > day),
      )
      .reduce((n, h) => n + h.amount, 0)
  );
}
/** Every period reconciles Opening + signed movements = Closing, including partial date ranges. */
export function buildLedgerRows(
  view: WorkspaceView,
  vanIds: string[],
  by: AggregateBy,
  from?: Date,
  to?: Date,
  searchUtr = '',
): LedgerRow[] {
  const allowed = new Set(view.balances.map((b) => b.van.id));
  if (vanIds.some((id) => !allowed.has(id)))
    throw new Error('Financial account is outside your grant.');
  const start = from ? ledgerDay(from.toISOString()) : '',
    end = to ? ledgerDay(to.toISOString()) : '9999-12-31';
  const rows: LedgerRow[] = [];
  for (const vanId of [...new Set(vanIds)]) {
    const van = view.balances.find((b) => b.van.id === vanId)!.van;
    const all = view.movements
      .filter((m) => m.vanId === vanId)
      .sort((a, b) => a.postedAt.localeCompare(b.postedAt) || a.id.localeCompare(b.id));
    let running =
      van.opening +
      all.filter((m) => ledgerDay(m.postedAt) < start).reduce((n, m) => n + m.amount, 0);
    const groups = new Map<string, { label: string; items: Movement[] }>();
    for (const m of all.filter(
      (m) => ledgerDay(m.postedAt) >= start && ledgerDay(m.postedAt) <= end,
    )) {
      const { key, label } = periodFor(m.postedAt, by);
      const group = groups.get(key) || { label, items: [] };
      group.items.push(m);
      groups.set(key, group);
    }
    for (const [key, { label, items }] of groups) {
      const row: LedgerRow = {
        id: `${vanId}:${key}`,
        vanId,
        vanLabel: van.label,
        period: label,
        periodKey: key,
        opening: running,
        deposits: 0,
        premium: 0,
        accountRefund: 0,
        floatRefund: 0,
        bankRefundCredit: 0,
        depositAdjustment: 0,
        premiumAdjustment: 0,
        depositRefund: 0,
        tcs: 0,
        tds: 0,
        utrs: [],
        closing: 0,
        held: 0,
        available: 0,
        movementIds: [],
      };
      for (const m of items) {
        row.movementIds.push(m.id);
        running += m.amount;
        if (
          m.source !== 'Restricted attribution' &&
          ['deposit', 'payout', 'deposit-refund'].includes(m.kind)
        )
          row.utrs.push(m.source);
        switch (m.kind) {
          case 'deposit':
            row.deposits += m.amount;
            break;
          case 'premium':
            row.premium -= m.amount;
            break;
          case 'payout':
            row.accountRefund -= m.amount;
            break;
          case 'refund-credit':
            row.floatRefund += m.amount;
            break;
          case 'bank-refund-credit':
            row.bankRefundCredit += m.amount;
            break;
          case 'tds':
            row.tds += m.amount;
            break;
          case 'tcs':
            row.tcs += m.amount;
            break;
          case 'deposit-adjustment':
            row.depositAdjustment += m.amount;
            break;
          case 'deposit-refund':
            row.depositRefund -= m.amount;
            break;
          case 'adjustment':
          case 'premium-adjustment':
            row.premiumAdjustment += m.amount;
            break;
        }
      }
      row.closing = running;
      row.held = heldAt(view, vanId, ledgerDay(items.at(-1)!.postedAt));
      row.available = running - row.held;
      rows.push(row);
    }
  }
  const needle = searchUtr.trim().toLowerCase();
  return rows
    .filter((r) => !needle || r.utrs.some((u) => u.toLowerCase().includes(needle)))
    .sort((a, b) => b.periodKey.localeCompare(a.periodKey) || a.vanId.localeCompare(b.vanId));
}
export const csvCell = (v: string | number) => {
  const raw = String(v);
  const safe = /^-?\d+(\.\d+)?$/.test(raw) ? raw : raw.replace(/^[=+@\t\r-]/, "'");
  return `"${safe.replaceAll('"', '""')}"`;
};
export function ledgerCsv(rows: LedgerRow[], cutoff: string) {
  const header = [
    'Period',
    'VAN',
    'Opening',
    'Deposits',
    'Deposit adjustment',
    'Deposit refund',
    'Premium',
    'Premium adjustment',
    'Float refund',
    'Bank refund credit',
    'Account refund',
    'TDS',
    'TCS',
    'Closing',
    'Held',
    'Available',
    'References',
    'Snapshot cutoff',
  ];
  return [
    header,
    ...rows.map((r) => [
      r.period,
      r.vanId,
      ...[
        r.opening,
        r.deposits,
        r.depositAdjustment,
        r.depositRefund,
        r.premium,
        r.premiumAdjustment,
        r.floatRefund,
        r.bankRefundCredit,
        r.accountRefund,
        r.tds,
        r.tcs,
        r.closing,
        r.held,
        r.available,
      ].map((v) => (v / 100).toFixed(2)),
      r.utrs.join('; '),
      cutoff,
    ]),
  ]
    .map((r) => r.map(csvCell).join(','))
    .join('\r\n');
}
export function transactionsCsv(view: WorkspaceView, rows: LedgerRow[], cutoff: string) {
  const ids = new Set(rows.flatMap((r) => r.movementIds));
  return [
    [
      'VAN',
      'Posted at',
      'Effective date',
      'Type',
      'Signed amount INR',
      'Reference',
      'Reason',
      'Corrects',
      'Policy',
      'Mapping version',
      'Snapshot cutoff',
    ],
    ...view.movements
      .filter((m) => ids.has(m.id))
      .map((m) => [
        m.vanId,
        m.postedAt,
        m.effectiveAt || m.postedAt,
        m.kind,
        (m.amount / 100).toFixed(2),
        m.source,
        m.description,
        m.corrects || '',
        m.policyId || '',
        m.mappingVersion || 1,
        cutoff,
      ]),
  ]
    .map((r) => r.map(csvCell).join(','))
    .join('\r\n');
}

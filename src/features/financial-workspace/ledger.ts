import type { Movement, WorkspaceView } from './domain';

export type AggregateBy = 'Day' | 'Month' | 'Quarter';
export interface LedgerRow {
  id: string;
  vanId: string;
  vanLabel: string;
  period: string;
  periodKey: string;
  deposits: number;
  premium: number;
  accountRefund: number;
  floatRefund: number;
  tcs: number;
  tds: number;
  utrs: string[];
  closing: number;
  movementIds: string[];
}

const day = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));

function periodFor(iso: string, aggregateBy: AggregateBy): { key: string; label: string } {
  const date = day(iso);
  const [year, month] = date.split('-').map(Number);
  if (aggregateBy === 'Day')
    return {
      key: date,
      label: new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    };
  if (aggregateBy === 'Month')
    return {
      key: `${year}-${String(month).padStart(2, '0')}`,
      label: new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }),
    };
  const quarter = Math.floor((month - 1) / 3) + 1;
  return { key: `${year}-Q${quarter}`, label: `Q${quarter} ${year}` };
}

/** Ledger periods remain separate for every VAN, even when the group shares APD. */
export function buildLedgerRows(
  view: WorkspaceView,
  vanIds: string[],
  aggregateBy: AggregateBy,
  from?: Date,
  to?: Date,
  searchUtr = '',
): LedgerRow[] {
  const permitted = new Set(view.balances.map((b) => b.van.id));
  if (vanIds.some((id) => !permitted.has(id)))
    throw new Error('Financial account is outside your grant.');
  const selected = new Set(vanIds);
  const grouped = new Map<string, { row: LedgerRow; movements: Movement[] }>();
  const movements = view.movements
    .filter((movement) => selected.has(movement.vanId))
    .sort((a, b) => a.postedAt.localeCompare(b.postedAt) || a.id.localeCompare(b.id));
  for (const movement of movements) {
    const posted = day(movement.postedAt);
    if (from && posted < day(from.toISOString())) continue;
    if (to && posted > day(to.toISOString())) continue;
    const { key, label } = periodFor(movement.postedAt, aggregateBy);
    const id = `${movement.vanId}:${key}`;
    let group = grouped.get(id);
    if (!group) {
      const van = view.balances.find((b) => b.van.id === movement.vanId)!.van;
      group = {
        row: {
          id,
          vanId: van.id,
          vanLabel: van.label,
          period: label,
          periodKey: key,
          deposits: 0,
          premium: 0,
          accountRefund: 0,
          floatRefund: 0,
          tcs: 0,
          tds: 0,
          utrs: [],
          closing: van.opening,
          movementIds: [],
        },
        movements: [],
      };
      grouped.set(id, group);
    }
    group.movements.push(movement);
    group.row.movementIds.push(movement.id);
    if (movement.kind === 'deposit') {
      group.row.deposits += movement.amount;
      if (movement.source !== 'Restricted attribution') group.row.utrs.push(movement.source);
    } else if (movement.kind === 'premium') group.row.premium += -movement.amount;
    else if (movement.kind === 'refund-credit') group.row.floatRefund += movement.amount;
    else if (movement.kind === 'payout') group.row.accountRefund += -movement.amount;
    else if (movement.kind === 'adjustment') {
      // The demo model has no tax-adjustment subtype; keep the balance exact without inventing TCS/TDS.
      if (movement.amount >= 0) group.row.deposits += movement.amount;
      else group.row.premium += -movement.amount;
    }
  }
  const rows = [...grouped.values()].map(({ row }) => {
    const van = view.balances.find((b) => b.van.id === row.vanId)!.van;
    row.closing =
      van.opening +
      view.movements
        .filter(
          (m) => m.vanId === row.vanId && periodFor(m.postedAt, aggregateBy).key <= row.periodKey,
        )
        .reduce((sum, m) => sum + m.amount, 0);
    return row;
  });
  const needle = searchUtr.trim().toLowerCase();
  return rows
    .filter((row) => !needle || row.utrs.some((utr) => utr.toLowerCase().includes(needle)))
    .sort((a, b) => b.periodKey.localeCompare(a.periodKey) || a.vanId.localeCompare(b.vanId));
}

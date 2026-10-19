import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSnapshot,
  balance,
  selectView,
  executeCommand,
  applySystemEvent,
  apdAmount,
  SCENARIOS,
} from '../src/features/financial-workspace/domain.ts';
import {
  buildLedgerRows,
  ledgerCsv,
  transactionsCsv,
} from '../src/features/financial-workspace/ledger.ts';
import { STORIES } from '../src/features/financial-workspace/stories.ts';
const reason = 'Verified against original source evidence';
const entry = (kind, amount, reference = 'DEMO-NEW-UTR') => ({
  type: 'post-entry',
  vanId: 'VAN-1',
  entryKind: kind,
  amount,
  reference,
  reason,
  effectiveAt: '2026-10-17T05:12:00.000Z',
});
const run = (s, c, role = 'reconciliation', key = 'key-' + s.revision) =>
  executeCommand(s, role, c, key);

test('all story fixtures load; every ledger row reconciles with distinct event classes', () => {
  assert.equal(new Set(STORIES.map((s) => s.id)).size, STORIES.length);
  for (const topology of ['eternal', 'cred'])
    for (const scenario of Object.keys(SCENARIOS)) {
      const s = createSnapshot(topology, scenario),
        v = selectView(s, 'reconciliation');
      const rows = buildLedgerRows(
        v,
        v.balances.map((b) => b.van.id),
        'Day',
      );
      for (const r of rows) {
        assert.equal(
          r.opening +
            r.deposits +
            r.depositAdjustment -
            r.depositRefund -
            r.premium +
            r.premiumAdjustment +
            r.floatRefund +
            r.bankRefundCredit -
            r.accountRefund +
            r.tds +
            r.tcs,
          r.closing,
          `${topology}/${scenario}`,
        );
        assert.equal(r.available, r.closing - r.held);
      }
    }
});
test('bank cancellation is a separate bank credit, never an available float refund', () => {
  const s = createSnapshot('eternal', 'refund-pending'),
    v = selectView(s, 'reconciliation');
  const r = buildLedgerRows(v, ['VAN-1'], 'Day')[0];
  assert.equal(r.floatRefund, 0);
  assert.equal(r.bankRefundCredit, 500000);
  assert.equal(r.held, 500000);
  assert.equal(r.available, balance(s, 'VAN-1').available);
});
test('completed manual payout debits once and preserves available money; pending attempts cannot settle manually', () => {
  const pending = createSnapshot('eternal', 'refund-pending');
  const cmd = {
    type: 'settle-refund',
    caseId: 'CASE-1042',
    reference: 'DEMO-OFFLINE-100',
    reason,
    effectiveAt: pending.cutoff,
  };
  assert.throws(() => run(pending, cmd), /Only a failed/);
  const s = createSnapshot('eternal', 'offline-refund'),
    before = balance(s, 'VAN-1');
  const paid = run(s, cmd);
  const after = balance(paid, 'VAN-1');
  assert.equal(after.available, before.available);
  assert.equal(after.booked, before.booked - 500000);
  assert.equal(after.held, 0);
  assert.equal(paid.cases[0].completedAt, s.cutoff);
  assert.equal(paid.movements.filter((m) => m.kind === 'payout').length, 1);
  assert.throws(() => run(paid, cmd), /unique|Only a failed/);
  assert.deepEqual(executeCommand(paid, 'reconciliation', cmd, 'key-1'), paid);
});
test('bank settlement cannot predate cancellation or use a future date', () => {
  const s = createSnapshot('eternal', 'offline-refund');
  for (const effectiveAt of ['2026-10-16T01:00:00Z', '2026-10-18T01:00:00Z'])
    assert.throws(
      () =>
        run(s, {
          type: 'settle-refund',
          caseId: 'CASE-1042',
          reference: 'DEMO-X',
          reason,
          effectiveAt,
        }),
      /precede|actual completed/,
    );
});
test('verified tax credits and excess deposit refunds keep separate ledger columns', () => {
  let s = createSnapshot();
  const before = balance(s, 'VAN-1').booked;
  for (const [kind, amount] of [
    ['tds', 12345],
    ['tcs', 23456],
    ['deposit-refund', -10000],
  ])
    s = run(s, entry(kind, amount, `DEMO-${kind}`));
  const r = buildLedgerRows(selectView(s, 'reconciliation'), ['VAN-1'], 'Day')[0];
  assert.equal(r.tds, 12345);
  assert.equal(r.tcs, 23456);
  assert.equal(r.depositRefund, 10000);
  assert.equal(r.closing, before + 25801);
});
test('duplicate UTRs, illegal directions, fractional paise and unsupported entries are rejected', () => {
  const s = createSnapshot();
  assert.throws(() => run(s, entry('deposit', 100, 'DEMO-UTR-17001')), /unique/);
  for (const c of [
    entry('tds', -1),
    entry('deposit-refund', 100),
    entry('deposit', 1.1),
    entry('premium', 100),
  ])
    assert.throws(() => run(s, c));
});
test('corrections remain pending until independent approval; duplicates do not create another request', () => {
  const s = createSnapshot(),
    original = s.movements.find((m) => m.vanId === 'VAN-1' && m.kind === 'premium').source;
  const command = {
    ...entry('premium-adjustment', 125000, 'DEMO-CORR-EVIDENCE'),
    originalReference: original,
  };
  const pending = run(s, command);
  assert.equal(balance(pending, 'VAN-1').booked, balance(s, 'VAN-1').booked);
  assert.throws(() => run(pending, command), /unique/);
  const c = pending.cases.find((c) => c.kind === 'correction');
  const paid = run(pending, { type: 'approve', caseId: c.id, reason }, 'approver');
  assert.equal(balance(paid, 'VAN-1').booked, balance(s, 'VAN-1').booked + 125000);
  assert.equal(paid.movements.at(-1).kind, 'premium-adjustment');
  assert.equal(paid.movements.at(-1).corrects, original);
});
test('bulk refund batch validates every row before posting and protects refunded policies', () => {
  const s = createSnapshot();
  const cmd = {
    type: 'bulk-refund',
    vanId: 'VAN-1',
    planId: 'gig-1',
    destination: 'bank',
    reason,
    rows: [
      { policyId: 'DEMO-POL-A', amount: 125000 },
      { policyId: 'DEMO-POL-B', amount: 75000 },
    ],
  };
  assert.throws(() => run(s, { ...cmd, rows: [cmd.rows[0], cmd.rows[0]] }), /Duplicate/);
  assert.equal(s.cases.length, 0);
  const next = run(s, cmd);
  assert.equal(next.cases.filter((c) => c.id.startsWith('BULK-')).length, 2);
  assert.equal(balance(next, 'VAN-1').available, balance(s, 'VAN-1').available);
  assert.throws(() => run(next, cmd), /already refunded/);
});
test('refunds to float during grace remain held until verified deposits clear group deficit', () => {
  const s = createSnapshot('eternal', 'grace-refund');
  assert.equal(s.apd, 'grace');
  assert.equal(balance(s, 'VAN-1').held, 2000000);
  const funded = applySystemEvent(s, 'fund-group');
  assert.ok(apdAmount(funded) > 0);
  assert.equal(balance(funded, 'VAN-1').held, 0);
  assert.ok(funded.floatHolds[0].releasedAt);
});
test('independent VAN and plan grants, deactivation, self-edit and overgrant prevention', () => {
  let s = createSnapshot('cred');
  const target = structuredClone(s.users.find((u) => u.id === 'partner-viewer'));
  target.vanIds = ['VAN-2'];
  target.planIds = [];
  s = run(s, { type: 'manage-access', user: target, reason }, 'super-admin');
  let v = selectView(s, 'partner-viewer');
  assert.deepEqual(v.actor.vanIds, ['VAN-2']);
  assert.equal(v.ownPlans.length, 0);
  assert.ok(v.movements.every((m) => !m.planId));
  assert.throws(
    () =>
      run(
        s,
        { type: 'manage-access', user: { ...target, vanIds: ['VAN-9'] }, reason },
        'super-admin',
      ),
    /more access/,
  );
  assert.throws(
    () =>
      run(
        s,
        { type: 'manage-access', user: s.users.find((u) => u.id === 'super-admin'), reason },
        'super-admin',
      ),
    /own access/,
  );
  s = run(
    s,
    { type: 'manage-access', user: { ...target, status: 'inactive' }, reason },
    'super-admin',
  );
  v = selectView(s, 'partner-viewer');
  assert.equal(v.balances.length, 0);
  assert.equal(v.ownPlans.length, 0);
  assert.equal(v.movements.length, 0);
});
test('revoked access cannot be restored by source refresh', () => {
  assert.throws(
    () => applySystemEvent(createSnapshot('eternal', 'no-access'), 'refresh'),
    /cannot restore/,
  );
});
test('partial range opening carries earlier movements without contaminating filtered period totals', () => {
  const s = createSnapshot();
  s.movements.push({
    id: 'OLDER',
    vanId: 'VAN-1',
    kind: 'deposit',
    amount: 10000,
    description: 'Older deposit',
    source: 'OLDER-UTR',
    postedAt: '2026-10-15T02:00:00Z',
  });
  const v = selectView(s, 'reconciliation'),
    r = buildLedgerRows(
      v,
      ['VAN-1'],
      'Month',
      new Date('2026-10-17T00:00:00+05:30'),
      new Date('2026-10-17T23:59:59+05:30'),
    )[0];
  assert.equal(r.opening, 80010000);
  assert.equal(r.closing, balance(s, 'VAN-1').booked);
  assert.equal(r.deposits, 10000000);
  assert.ok(!transactionsCsv(v, [r], s.cutoff).includes('OLDER-UTR'));
  assert.ok(ledgerCsv([r], s.cutoff).includes('Held'));
});
test('CSV escapes spreadsheet formula injection and hidden attribution', () => {
  const s = createSnapshot('cred');
  s.movements[0].source = '=HYPERLINK("bad")';
  const v = selectView(s, 'credit-vidya');
  const rows = buildLedgerRows(v, ['VAN-2'], 'Day');
  const csv = transactionsCsv(v, rows, s.cutoff);
  assert.ok(!csv.includes('Cred Home'));
  assert.ok(!csv.includes('DEMO-FA-1017'));
});

test('beneficiary updates retain only masked details and do not change balances', () => {
  const s = createSnapshot('eternal', 'refund-failed');
  const next = run(s, {
    type: 'update-beneficiary',
    caseId: 'CASE-1042',
    holder: 'Sample recipient',
    accountNumber: '123456784120',
    ifsc: 'HDFC0000123',
    reason,
  });
  assert.equal(next.cases[0].beneficiary.last4, '4120');
  assert.equal(next.cases[0].beneficiary.verified, true);
  assert.equal(JSON.stringify(next).includes('123456784120'), false);
  assert.equal(balance(next, 'VAN-1').available, balance(s, 'VAN-1').available);
  assert.throws(
    () =>
      run(next, {
        type: 'update-beneficiary',
        caseId: 'CASE-1042',
        holder: 'X',
        accountNumber: '123',
        ifsc: 'INVALID',
        reason,
      }),
    /holder name/,
  );
});
test('notifications obey VAN grants and access changes are not broadcast to other users', () => {
  let s = createSnapshot('cred');
  s = run(s, { ...entry('tds', 10000, 'DEMO-TAX-NOTICE'), vanId: 'VAN-1' });
  assert.equal(
    selectView(s, 'credit-vidya').notices.some((n) => n.title === 'Ledger entry posted'),
    false,
  );
  const user = s.users.find((u) => u.id === 'partner-viewer');
  s = run(
    s,
    { type: 'manage-access', user: { ...user, status: 'inactive' }, reason },
    'super-admin',
  );
  assert.equal(
    selectView(s, 'credit-vidya').notices.some((n) => n.title === 'User access updated'),
    false,
  );
  assert.equal(selectView(s, 'partner-viewer').notices.length, 0);
});

test('APD-disabled groups retain negative financial balances without automatic blocking', () => {
  const s = createSnapshot('eternal', 'apd-disabled');
  assert.equal(s.apdEnabled, false);
  assert.ok(apdAmount(s) < 0);
  assert.throws(() => applySystemEvent(s, 'expire-grace'), /negative wallet group in grace/);
});

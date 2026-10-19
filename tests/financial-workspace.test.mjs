import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSnapshot,
  balance,
  apdAmount,
  selectView,
  executeCommand,
  applySystemEvent,
  changeApdBasis,
  exportStatement,
  exportStatements,
} from '../src/features/financial-workspace/domain.ts';
import { buildLedgerRows } from '../src/features/financial-workspace/ledger.ts';

test('Eternal group grant shows four separate accounts and ledger balances', () => {
  const snapshot = createSnapshot('eternal');
  const view = selectView(snapshot, 'eternal-group-finance');
  const vanIds = view.balances.map((b) => b.van.id);
  assert.deepEqual(vanIds, ['VAN-1', 'VAN-2', 'VAN-3', 'VAN-4']);
  const rows = buildLedgerRows(view, vanIds, 'Day');
  assert.equal(rows.length, 4);
  for (const row of rows) assert.equal(row.closing, balance(snapshot, row.vanId).booked);
  assert.equal(rows.find((row) => row.vanId === 'VAN-2').closing, -12000000);
  const csv = exportStatements(snapshot, 'eternal-group-finance', vanIds);
  assert.equal((csv.match(/Closing booked balance/g) || []).length, 4);
  assert.equal(csv.includes('VAN-4'), true);
});

test('all-account ledger and export reject VANs outside the user grant', () => {
  const snapshot = createSnapshot('eternal');
  const view = selectView(snapshot, 'partner-finance');
  assert.deepEqual(view.actor.vanIds, ['VAN-1']);
  assert.throws(() => buildLedgerRows(view, ['VAN-1', 'VAN-2'], 'Day'), /outside your grant/);
  assert.throws(
    () => exportStatements(snapshot, 'partner-finance', ['VAN-1', 'VAN-2']),
    /unavailable/,
  );
  assert.equal(
    buildLedgerRows(view, ['VAN-1'], 'Day', undefined, undefined, 'DEMO-UTR-17001').length,
    1,
  );
  assert.equal(buildLedgerRows(view, ['VAN-1'], 'Day', undefined, undefined, 'no-match').length, 0);
});

test('Eternal counts each VAN once, including a negative VAN in a positive group', () => {
  const s = createSnapshot();
  assert.equal(balance(s, 'VAN-1').booked, 85000000);
  assert.equal(balance(s, 'VAN-2').booked, -12000000);
  assert.equal(apdAmount(s), 138000000);
  s.memberVanIds.push('VAN-1');
  assert.equal(apdAmount(s), 138000000);
});
test('financial grants and exports redact other partner attribution on shared Cred V2', () => {
  const s = createSnapshot('cred');
  const v = selectView(s, 'credit-vidya');
  assert.deepEqual(v.actor.vanIds, ['VAN-2']);
  assert.equal(v.groupTotal, null);
  assert.equal(
    v.movements.some((m) => m.planId === 'cred_home'),
    false,
  );
  const csv = exportStatement(s, 'credit-vidya', 'VAN-2');
  assert.equal(csv.includes('cred_home'), false);
  assert.equal(csv.includes('DEMO-FA-1017'), false);
  assert.throws(() => exportStatement(s, 'credit-vidya', 'VAN-1'), /unavailable/);
});
test('operations and revoked grants expose no financial amounts or movements', () => {
  for (const role of ['partner-ops', 'partner-finance']) {
    const v = selectView(
      createSnapshot('eternal', role === 'partner-finance' ? 'no-access' : 'healthy'),
      role,
    );
    assert.equal(v.balances.length, 0);
    assert.equal(v.movements.length, 0);
    assert.equal(v.visibleTotal, null);
  }
});
test('reporting leaves money unchanged; verified match credits once and clears negative APD', () => {
  let s = createSnapshot('eternal', 'grace');
  const before = balance(s, 'VAN-1').booked;
  const command = {
    type: 'report-deposit',
    vanId: 'VAN-1',
    amount: 20000000,
    reference: 'TEST-UTR-001',
    reason: 'Bank transfer confirmed by partner.',
  };
  s = executeCommand(s, 'partner-finance', command, 'id-1');
  assert.equal(balance(s, 'VAN-1').booked, before);
  assert.equal(s.apd, 'grace');
  assert.throws(() => executeCommand(s, 'partner-finance', command, 'id-2'), /already recorded/);
  const match = {
    type: 'match',
    caseId: s.cases[0].id,
    reason: 'Bank amount and destination verified.',
  };
  assert.throws(() => executeCommand(s, 'partner-finance', match, 'id-3'), /does not allow/);
  s = executeCommand(s, 'reconciliation', match, 'id-3');
  assert.equal(balance(s, 'VAN-1').booked, before + 20000000);
  assert.equal(s.apd, 'low');
  assert.equal(executeCommand(s, 'reconciliation', match, 'id-3'), s);
  assert.throws(() => executeCommand(s, 'reconciliation', match, 'id-4'), /pending deposit/);
});
test('failed payout, retry and settlement preserve one obligation and debit exactly once', () => {
  let s = createSnapshot('eternal', 'refund-pending');
  assert.equal(balance(s, 'VAN-1').available, 85000000);
  assert.equal(balance(s, 'VAN-1').held, 500000);
  s = applySystemEvent(s, 'payout-failure');
  assert.equal(balance(s, 'VAN-1').held, 500000);
  assert.equal(s.movements.filter((m) => m.kind === 'payout').length, 0);
  s = executeCommand(
    s,
    'reconciliation',
    { type: 'retry', caseId: 'CASE-1042', reason: 'Verified corrected beneficiary details.' },
    'retry-1',
  );
  s = applySystemEvent(s, 'payout-success');
  assert.equal(balance(s, 'VAN-1').held, 0);
  assert.equal(balance(s, 'VAN-1').booked, 85000000);
  assert.throws(() => applySystemEvent(s, 'payout-success'), /No pending payout/);
});
test('corrections need a separate approver; view-only users cannot submit', () => {
  const command = {
    type: 'correct',
    vanId: 'VAN-1',
    amount: -50000,
    reference: 'DEMO-FA-0017',
    reason: 'Correct source premium discrepancy.',
  };
  let s = createSnapshot();
  assert.throws(() => executeCommand(s, 'partner-viewer', command, 'c0'), /does not allow/);
  s = executeCommand(s, 'reconciliation', command, 'c1');
  assert.equal(balance(s, 'VAN-1').booked, 85000000);
  const approve = {
    type: 'approve',
    caseId: s.cases[0].id,
    reason: 'Source evidence independently verified.',
  };
  const self = structuredClone(s);
  self.cases[0].maker = 'approver';
  assert.throws(
    () => executeCommand(self, 'approver', approve, 'c2'),
    /different authorized person/,
  );
  s = executeCommand(s, 'approver', approve, 'c2');
  assert.equal(balance(s, 'VAN-1').booked, 84950000);
});
test('source failure hides balances; stale data blocks money actions', () => {
  assert.equal(selectView(createSnapshot('cred', 'error'), 'reconciliation').balances.length, 0);
  assert.throws(
    () =>
      executeCommand(
        createSnapshot('cred', 'stale'),
        'partner-finance',
        {
          type: 'report-deposit',
          vanId: 'VAN-1',
          amount: 100,
          reference: 'TEST-UTR',
          reason: 'Transfer with delayed source.',
        },
        'x',
      ),
    /Current source data/,
  );
  assert.equal(
    selectView(createSnapshot('eternal', 'empty'), 'partner-finance').visibleTotal,
    null,
  );
});
test('APD transitions are guarded and recovery does not cancel policies automatically', () => {
  assert.throws(() => applySystemEvent(createSnapshot(), 'expire-grace'), /negative wallet group/);
  let s = applySystemEvent(createSnapshot('cred', 'grace'), 'expire-grace');
  assert.equal(s.apd, 'blocked');
  s = applySystemEvent(s, 'expire-recovery');
  assert.equal(s.apd, 'recovery');
  assert.match(s.notices[0].body, /No automatic cancellation/);
});

test('mapping approval waits for activation and leaves historical money and membership intact', () => {
  let s = createSnapshot();
  const original = structuredClone(s);
  const request = {
    type: 'mapping',
    vanId: 'VAN-1',
    reason: 'Preview approved business restructuring.',
  };
  s = executeCommand(s, 'reconciliation', request, 'map-1');
  s = executeCommand(
    s,
    'approver',
    {
      type: 'approve',
      caseId: s.cases[0].id,
      reason: 'Impact independently reviewed; destination pending.',
    },
    'map-2',
  );
  assert.equal(s.cases[0].status, 'awaiting-activation');
  assert.deepEqual(s.memberVanIds, original.memberVanIds);
  assert.deepEqual(s.movements, original.movements);
  assert.equal(apdAmount(s), apdAmount(original));
  assert.throws(() => executeCommand(s, 'reconciliation', request, 'map-3'), /already exists/);
});

test('dispute resolution records outcome without silently adjusting money', () => {
  let s = createSnapshot();
  const before = balance(s, 'VAN-1').booked;
  s = executeCommand(
    s,
    'partner-finance',
    {
      type: 'dispute',
      vanId: 'VAN-1',
      reference: 'DEMO-FA-0017',
      reason: 'Please investigate the premium source.',
    },
    'd-1',
  );
  s = executeCommand(
    s,
    'reconciliation',
    {
      type: 'resolve',
      caseId: s.cases[0].id,
      reason: 'Source verified; no financial correction required.',
    },
    'd-2',
  );
  assert.equal(s.cases[0].status, 'resolved');
  assert.equal(balance(s, 'VAN-1').booked, before);
});

test('APD basis changes recalculate eligibility and original statement mapping versions persist', () => {
  let s = createSnapshot('eternal', 'refund-pending');
  for (const v of s.vans) v.opening = 0;
  s.movements = [
    {
      id: 'M1',
      vanId: 'VAN-1',
      kind: 'deposit',
      amount: 100000,
      description: 'Test credit',
      source: 'TEST',
      postedAt: s.cutoff,
      mappingVersion: 1,
    },
  ];
  s = changeApdBasis(s, 'available');
  assert.equal(s.apd, 'grace');
  s = changeApdBasis(s, 'booked');
  assert.equal(s.apd, 'low');
  s.mappingVersion = 2;
  const csv = exportStatement(s, 'reconciliation', 'VAN-1');
  assert.match(
    csv.split('\r\n').find((row) => row.includes('Test credit')),
    /,"1"$/,
  );
});

test('mismatch blocks money writes and corrections must link to an existing VAN source', () => {
  const correction = {
    type: 'correct',
    vanId: 'VAN-1',
    amount: 100,
    reference: 'MISSING',
    reason: 'Investigate source-linked adjustment.',
  };
  assert.throws(
    () => executeCommand(createSnapshot('eternal', 'mismatch'), 'reconciliation', correction, 'x1'),
    /Current source data/,
  );
  assert.throws(
    () => executeCommand(createSnapshot(), 'reconciliation', correction, 'x2'),
    /existing source reference/,
  );
});

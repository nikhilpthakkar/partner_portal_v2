import test from 'node:test';
import assert from 'node:assert/strict';
import { executeCommand, apdAmount, selectView } from '../src/features/financial-workspace/domain.ts';
import { createPortfolio, groupSummary, permittedGroups } from '../src/features/financial-workspace/portfolio.ts';

const reason = 'Reviewed with partner finance';

test('one user can see independent wallet groups with no shared VAN identity', () => {
  const groups = createPortfolio('grace');
  const first = groups['WG-ETERNAL'];
  const second = groups['WG-LENDING'];
  assert.equal(permittedGroups(groups, 'portfolio-finance').length, 2);
  assert.equal(new Set([...first.memberVanIds, ...second.memberVanIds]).size, 6);
  assert.equal(first.apd, 'healthy');
  assert.equal(second.apd, 'grace');
  assert.equal(apdAmount(first), 138000000);
  assert.ok(apdAmount(second) < 0);
  const totals = [first, second].map((group) => groupSummary(group, 'portfolio-finance'));
  assert.equal(totals.reduce((sum, item) => sum + item.available, 0), totals[0].available + totals[1].available);
});

test('an unverified group withholds the cross-group sum', () => {
  const groups = createPortfolio('stale');
  assert.equal(groupSummary(groups['WG-LENDING'], 'portfolio-finance').available, null);
  assert.notEqual(groupSummary(groups['WG-ETERNAL'], 'portfolio-finance').available, null);
});

test('access change, deposit and rename in one group do not alter another', () => {
  const groups = createPortfolio();
  const first = groups['WG-ETERNAL'];
  const second = structuredClone(groups['WG-LENDING']);
  const user = structuredClone(first.users.find((item) => item.id === 'partner-viewer'));
  user.vanIds = ['VAN-1'];
  const changed = executeCommand(first, 'super-admin', { type: 'manage-access', user, reason }, 'group-access-1');
  assert.deepEqual(selectView(changed, 'partner-viewer').balances.map((item) => item.van.id), ['VAN-1']);
  assert.deepEqual(groups['WG-LENDING'], second);
  const renamed = executeCommand(changed, 'super-admin', { type: 'rename-group', name: 'Delivery business', reason }, 'group-name-1');
  assert.equal(renamed.groupId, first.groupId);
  assert.deepEqual(renamed.memberVanIds, first.memberVanIds);
  const funded = executeCommand(renamed, 'reconciliation', {
    type: 'post-entry', vanId: 'VAN-1', entryKind: 'deposit', amount: 1000000,
    reference: 'DEMO-WG-UTR-100', effectiveAt: first.cutoff, reason,
  }, 'group-deposit-1');
  assert.equal(funded.groupId, first.groupId);
  assert.deepEqual(groups['WG-LENDING'], second);
  assert.throws(() => executeCommand(second, 'reconciliation', {
    type: 'post-entry', vanId: 'VAN-1', entryKind: 'deposit', amount: 1000000,
    reference: 'DEMO-WG-UTR-101', effectiveAt: first.cutoff, reason,
  }, 'wrong-group'), /outside your financial grant/);
});

test('a delegated admin can rename only after receiving the group capability', () => {
  const group = createPortfolio()['WG-ETERNAL'];
  assert.throws(() => executeCommand(group, 'partner-viewer', {
    type: 'rename-group', name: 'Delivery business', reason,
  }, 'unauthorised-rename'), /does not allow/);
  const user = structuredClone(group.users.find((item) => item.id === 'partner-viewer'));
  user.capabilities.push('manage-group');
  const delegated = executeCommand(group, 'super-admin', {
    type: 'manage-access', user, reason,
  }, 'delegate-name');
  const renamed = executeCommand(delegated, 'partner-viewer', {
    type: 'rename-group', name: 'Delivery business', reason,
  }, 'delegated-rename');
  assert.equal(renamed.groupName, 'Delivery business');
  assert.equal(renamed.groupId, group.groupId);
});

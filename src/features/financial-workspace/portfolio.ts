import { actorFor, createSnapshot, selectView, type Role, type Scenario, type Snapshot } from './domain.ts';

export type GroupSnapshots = Record<string, Snapshot>;

/** Two independent groups under one illustrative user. VAN identities never span groups. */
export function createPortfolio(secondScenario: Scenario = 'healthy'): GroupSnapshots {
  const first = createSnapshot('eternal');
  const second = createSnapshot('cred', secondScenario);
  const vanId = (id: string) => ({ 'VAN-1': 'VAN-5', 'VAN-2': 'VAN-6' })[id] || id;
  second.groupId = 'WG-LENDING';
  second.groupName = 'Lending programs';
  second.memberVanIds = second.memberVanIds.map(vanId);
  second.vans = second.vans.map((van) => ({ ...van, id: vanId(van.id) }));
  second.movements = second.movements.map((movement) => ({ ...movement, vanId: vanId(movement.vanId) }));
  second.cases = second.cases.map((item) => ({
    ...item,
    vanId: vanId(item.vanId),
    targetVanId: item.targetVanId ? vanId(item.targetVanId) : undefined,
  }));
  second.floatHolds = second.floatHolds.map((hold) => ({ ...hold, vanId: vanId(hold.vanId) }));
  second.notices = second.notices.map((notice) => ({
    ...notice,
    vanId: notice.vanId ? vanId(notice.vanId) : undefined,
  }));
  second.users = second.users.map((user) => ({ ...user, vanIds: user.vanIds.map(vanId) }));
  return { [first.groupId]: first, [second.groupId]: second };
}

export function permittedGroups(groups: GroupSnapshots, role: Role): Snapshot[] {
  return Object.values(groups).filter((group) => {
    const actor = actorFor(group, role);
    return (actor.capabilities.includes('view') && actor.vanIds.length > 0) || actor.planIds.length > 0;
  });
}

export function groupSummary(group: Snapshot, role: Role) {
  const view = selectView(group, role);
  const trusted = view.actor.capabilities.includes('view') && view.balances.length > 0 && group.dataState === 'ready' && group.reconciliation === 'matched';
  return {
    groupId: group.groupId,
    name: group.groupName,
    vanCount: view.balances.length,
    totalVanCount: group.memberVanIds.length,
    booked: trusted ? view.balances.reduce((sum, item) => sum + item.booked, 0) : null,
    held: trusted ? view.balances.reduce((sum, item) => sum + item.held, 0) : null,
    available: trusted ? view.balances.reduce((sum, item) => sum + item.available, 0) : null,
    status: group.apd,
    dataState: group.dataState,
    cutoff: group.cutoff,
    complete: view.balances.length === group.memberVanIds.length,
    openItems: view.cases.filter((item) => ['open', 'pending', 'failed'].includes(item.status)).length,
  };
}

'use client';

import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  applySystemEvent,
  changeApdBasis,
  selectView,
  type Command,
  type Role,
  type Scenario,
  type Snapshot,
  type SystemEvent,
  type Topology,
} from './domain';
import { simulatorGateway, type FinanceGateway } from './gateway';
import { createPortfolio, permittedGroups, type GroupSnapshots } from './portfolio';

function useWorkspaceState(gateway: FinanceGateway) {
  const [groups, setGroups] = useState<GroupSnapshots>(() => createPortfolio());
  const [selectedGroupId, setSelectedGroupId] = useState('WG-ETERNAL');
  const [role, setRoleState] = useState<Role>('partner-finance');
  const [scenario, setScenario] = useState<Scenario>('healthy');
  const [selectedVan, setSelectedVan] = useState('VAN-1');
  const [pending, setPending] = useState(false);
  const [failNextAction, setFailNextAction] = useState(false);
  const [timeoutNextAction, setTimeoutNextAction] = useState(false);
  const [unknownOutcome, setUnknownOutcome] = useState<string | null>(null);
  const pendingOutcome = useRef<{ result: Snapshot; generation: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const inFlight = useRef(false);
  const availableGroups = permittedGroups(groups, role);
  const snapshot = groups[selectedGroupId] || availableGroups[0] || Object.values(groups)[0];
  const view = selectView(snapshot, role);
  const replaceGroup = (next: Snapshot) =>
    setGroups((current) => ({ ...current, [next.groupId]: next }));

  const setGroup = (id: string) => {
    if (pending || unknownOutcome) return;
    if (id !== 'all' && !availableGroups.some((group) => group.groupId === id)) return;
    if (id === 'all' && availableGroups.length < 2) return;
    generation.current += 1;
    setSelectedGroupId(id);
    const next = availableGroups.find((group) => group.groupId === id);
    const balances = next ? selectView(next, role).balances : [];
    setSelectedVan(balances.length > 1 ? 'all' : balances[0]?.van.id || 'all');
    setError(null);
  };

  const configure = async (topology: Topology, nextScenario: Scenario, nextRole?: Role) => {
    const request = ++generation.current;
    const result = await gateway.load(topology, nextScenario);
    if (request !== generation.current) return;
    setGroups({ [result.groupId]: result });
    setSelectedGroupId(result.groupId);
    if (nextRole) setRoleState(nextRole);
    setScenario(nextScenario);
    setSelectedVan('VAN-1');
    setError(null);
    setFailNextAction(false);
    setUnknownOutcome(null);
    pendingOutcome.current = null;
    setTimeoutNextAction(false);
    if (
      !nextRole &&
      ((topology === 'eternal' && role === 'credit-vidya') ||
        (topology === 'cred' && role === 'eternal-group-finance'))
    )
      setRoleState('partner-finance');
  };
  const configurePortfolio = (secondScenario: Scenario = 'healthy', initialGroup = 'all', nextRole: Role = 'portfolio-finance') => {
    generation.current += 1;
    setGroups(createPortfolio(secondScenario));
    setRoleState(nextRole);
    setSelectedGroupId(initialGroup);
    setScenario(secondScenario);
    setSelectedVan('all');
    setError(null);
    setFailNextAction(false);
    setTimeoutNextAction(false);
    setUnknownOutcome(null);
    pendingOutcome.current = null;
  };
  const setRole = (next: Role) => {
    generation.current += 1;
    setRoleState(next);
    const permitted = permittedGroups(groups, next);
    if (selectedGroupId === 'all' && permitted.length < 2)
      setSelectedGroupId(permitted[0]?.groupId || snapshot.groupId);
    else if (selectedGroupId !== 'all' && !permitted.some((group) => group.groupId === selectedGroupId))
      setSelectedGroupId(permitted[0]?.groupId || snapshot.groupId);
    const nextGroup = permitted.find((group) => group.groupId === selectedGroupId) || permitted[0];
    const balances = nextGroup ? selectView(nextGroup, next).balances : [];
    setSelectedVan(balances.length > 1 ? 'all' : balances[0]?.van.id || 'all');
    setError(null);
  };
  const execute = async (command: Command): Promise<boolean> => {
    if (inFlight.current || unknownOutcome || selectedGroupId === 'all') return false;
    inFlight.current = true;
    setPending(true);
    setError(null);
    const request = generation.current;
    const key = `LOCAL-${snapshot.revision}-${crypto.randomUUID()}`;
    try {
      if (failNextAction) {
        setFailNextAction(false);
        await new Promise((resolve) => setTimeout(resolve, 450));
        throw new Error(
          'The service could not complete this request. Your entries are preserved. Retry when ready.',
        );
      }
      const result = await gateway.execute(snapshot, role, command, key);
      if (request !== generation.current) return false;
      if (timeoutNextAction) {
        setTimeoutNextAction(false);
        pendingOutcome.current = { result, generation: request };
        setUnknownOutcome(key);
        setError('The response was interrupted. Check the request status before submitting again.');
        return false;
      }
      if (command.type === 'manage-access' && command.user.status === 'inactive') {
        setGroups((current) => Object.fromEntries(Object.entries(current).map(([id, group]) => [id,
          id === result.groupId ? result : { ...group, users: group.users.map((user) => user.id === command.user.id ? { ...user, status: 'inactive' as const } : user) },
        ])));
      } else replaceGroup(result);
      toast.success(result.audit.at(-1)?.title || 'Request completed');
      return true;
    } catch (e) {
      if (request === generation.current) {
        const message = e instanceof Error ? e.message : 'Something went wrong. Please retry.';
        setError(message);
        toast.error(message);
      }
      return false;
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  };
  const system = (event: SystemEvent) => {
    if (inFlight.current || unknownOutcome || selectedGroupId === 'all') return;
    try {
      generation.current += 1;
      const result = applySystemEvent(snapshot, event);
      replaceGroup(result);
      setError(null);
      toast.success(result.audit.at(-1)?.title);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to apply event');
    }
  };
  const checkOutcome = () => {
    const held = pendingOutcome.current;
    if (held && held.generation === generation.current) {
      replaceGroup(held.result);
      setError(null);
      toast.success('Request confirmed. The original operation completed once.');
    } else {
      setError('Context changed. Reload the scenario to retrieve a fresh authorized snapshot.');
    }
    setUnknownOutcome(null);
    pendingOutcome.current = null;
  };
  const setApdBasis = (basis: Snapshot['apdBasis']) => {
    generation.current += 1;
    replaceGroup(changeApdBasis(snapshot, basis));
  };
  const markRead = () => {
    const ids = new Set(selectedGroupId === 'all' ? availableGroups.map((g) => g.groupId) : [snapshot.groupId]);
    setGroups((current) => Object.fromEntries(Object.entries(current).map(([id, group]) => [id,
      ids.has(id) ? { ...group, notices: group.notices.map((notice) => ({ ...notice, read: true })) } : group,
    ])));
  };
  return {
    groups,
    availableGroups,
    selectedGroupId,
    setGroup,
    snapshot,
    view,
    role,
    setRole,
    scenario,
    configure,
    configurePortfolio,
    selectedVan,
    setSelectedVan,
    pending: pending || !!unknownOutcome,
    unknownOutcome,
    timeoutNextAction,
    setTimeoutNextAction,
    checkOutcome,
    error,
    clearError: () => setError(null),
    execute,
    system,
    failNextAction,
    setFailNextAction,
    setApdBasis,
    markRead,
  };
}

const WorkspaceContext = createContext<ReturnType<typeof useWorkspaceState> | null>(null);
export function FinancialWorkspaceProvider({
  children,
  gateway = simulatorGateway,
}: {
  children: ReactNode;
  gateway?: FinanceGateway;
}) {
  const value = useWorkspaceState(gateway);
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
export function useFinancialWorkspace() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error('FinancialWorkspaceProvider is required.');
  return value;
}

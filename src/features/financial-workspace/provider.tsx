'use client';

import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import {
  applySystemEvent,
  changeApdBasis,
  createSnapshot,
  selectView,
  type Command,
  type Role,
  type Scenario,
  type Snapshot,
  type SystemEvent,
  type Topology,
} from './domain';
import { simulatorGateway, type FinanceGateway } from './gateway';

function useWorkspaceState(gateway: FinanceGateway) {
  const [snapshot, setSnapshot] = useState(() => createSnapshot());
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
  const view = selectView(snapshot, role);

  const configure = async (topology: Topology, nextScenario: Scenario, nextRole?: Role) => {
    const request = ++generation.current;
    const result = await gateway.load(topology, nextScenario);
    if (request !== generation.current) return;
    setSnapshot(result);
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
  const setRole = (next: Role) => {
    generation.current += 1;
    setRoleState(next);
    setSelectedVan(next === 'credit-vidya' ? 'VAN-2' : 'VAN-1');
    setError(null);
  };
  const execute = async (command: Command): Promise<boolean> => {
    if (inFlight.current || unknownOutcome) return false;
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
      setSnapshot(result);
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
    if (inFlight.current || unknownOutcome) return;
    try {
      generation.current += 1;
      const result = applySystemEvent(snapshot, event);
      setSnapshot(result);
      setError(null);
      toast.success(result.audit.at(-1)?.title);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unable to apply event');
    }
  };
  const checkOutcome = () => {
    const held = pendingOutcome.current;
    if (held && held.generation === generation.current) {
      setSnapshot(held.result);
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
    setSnapshot((s) => changeApdBasis(s, basis));
  };
  const markRead = () =>
    setSnapshot((s) => ({ ...s, notices: s.notices.map((n) => ({ ...n, read: true })) }));
  return {
    snapshot,
    view,
    role,
    setRole,
    scenario,
    configure,
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

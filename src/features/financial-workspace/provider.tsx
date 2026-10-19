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
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const inFlight = useRef(false);
  const view = selectView(snapshot, role);

  const configure = async (topology: Topology, nextScenario: Scenario) => {
    const request = ++generation.current;
    const result = await gateway.load(topology, nextScenario);
    if (request !== generation.current) return;
    setSnapshot(result);
    setScenario(nextScenario);
    setSelectedVan('VAN-1');
    setError(null);
    setFailNextAction(false);
    if (
      (topology === 'eternal' && role === 'credit-vidya') ||
      (topology === 'cred' && role === 'eternal-group-finance')
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
    if (inFlight.current) return false;
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
    if (inFlight.current) return;
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
    pending,
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

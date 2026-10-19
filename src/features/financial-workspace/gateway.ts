import {
  createSnapshot,
  executeCommand,
  type Command,
  type Role,
  type Scenario,
  type Snapshot,
  type Topology,
} from './domain';

/** Replace at the provider boundary. A real BFF must derive grants from the authenticated session. */
export interface FinanceGateway {
  load(topology: Topology, scenario: Scenario): Promise<Snapshot>;
  execute(
    snapshot: Snapshot,
    role: Role,
    command: Command,
    idempotencyKey: string,
  ): Promise<Snapshot>;
}

export const simulatorGateway: FinanceGateway = {
  async load(topology, scenario) {
    return createSnapshot(topology, scenario);
  },
  async execute(snapshot, role, command, idempotencyKey) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return executeCommand(snapshot, role, command, idempotencyKey);
  },
};

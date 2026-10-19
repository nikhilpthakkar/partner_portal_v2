import type { Snapshot, WorkspaceView } from './domain';
let context: { snapshot: Snapshot; view: WorkspaceView } | null = null;
export const setLegacyContext = (next: { snapshot: Snapshot; view: WorkspaceView }) => {
  context = next;
};
export const readLegacyContext = () => context;

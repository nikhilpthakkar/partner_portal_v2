import { create } from 'zustand';

type PolicyShareStoreState = {
  policyId: string;
  isDialogOpen: boolean;
};

type PolicyShareStoreActions = {
  openShareDialog: (policyId: string) => void;
  closeShareDialog: () => void;
  setPolicyId: (policyId: string) => void;
};

export type PolicyShareStore = PolicyShareStoreState & PolicyShareStoreActions;

export const usePolicyShareStore = create<PolicyShareStore>((set) => ({
  policyId: '',
  isDialogOpen: false,

  openShareDialog: (policyId: string) => set({ policyId, isDialogOpen: true }),

  closeShareDialog: () => set({ policyId: '', isDialogOpen: false }),

  setPolicyId: (policyId: string) => set({ policyId }),
}));

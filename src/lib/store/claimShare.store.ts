import { create } from 'zustand';

type ClaimShareStoreState = {
  claimNumber: string;
  policyEkey: string;
  policyNumber: string;
  isDialogOpen: boolean;
};

type ClaimShareStoreActions = {
  openShareDialog: (claimNumber: string, policyEkey: string, policyNumber: string) => void;
  closeShareDialog: () => void;
  setClaimNumber: (claimNumber: string) => void;
  setPolicyEkey: (policyEkey: string) => void;
  setPolicyNumber: (policyNumber: string) => void;
};

export type ClaimShareStore = ClaimShareStoreState & ClaimShareStoreActions;

export const useClaimShareStore = create<ClaimShareStore>((set) => ({
  claimNumber: '',
  policyEkey: '',
  policyNumber: '',
  isDialogOpen: false,

  openShareDialog: (claimNumber: string, policyEkey: string, policyNumber: string) =>
    set({ claimNumber, policyEkey, policyNumber, isDialogOpen: true }),
  closeShareDialog: () =>
    set({ claimNumber: '', policyEkey: '', policyNumber: '', isDialogOpen: false }),
  setClaimNumber: (claimNumber: string) => set({ claimNumber }),
  setPolicyEkey: (policyEkey: string) => set({ policyEkey }),
  setPolicyNumber: (policyNumber: string) => set({ policyNumber }),
}));

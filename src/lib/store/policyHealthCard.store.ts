import { create } from 'zustand';

type PolicyHealthCardState = {
  policyId: string;
  uhid: string;
};

type PolicyHealthCardActions = {
  setPolicyId: (policyId: string) => void;
  setUhid: (uhid: string) => void;
};

export const usePolicyHealthCardStore = create<PolicyHealthCardState & PolicyHealthCardActions>(
  (set) => ({
    policyId: '',
    uhid: '',

    setPolicyId: (policyId) => set({ policyId }),

    setUhid: (uhid) => set({ uhid }),
  }),
);

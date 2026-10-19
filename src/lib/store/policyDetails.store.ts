import { create } from 'zustand';

import type { PolicyDetailsPanel } from '@/lib/types/policy-management/policyDetails';

type PolicyDetailsStoreState = {
  tabData: Record<string, PolicyDetailsPanel | undefined>;
};

type PolicyDetailsStoreActions = {
  setTabData: (tabId: string, panel: PolicyDetailsPanel) => void;
  resetTabData: (tabId: string) => void;
};

export type PolicyDetailsStore = PolicyDetailsStoreState & PolicyDetailsStoreActions;

export const usePolicyDetailsStore = create<PolicyDetailsStore>((set) => ({
  tabData: {},
  setTabData: (tabId: string, panel: PolicyDetailsPanel) =>
    set((state) => ({
      tabData: { ...state.tabData, [tabId]: panel },
    })),
  resetTabData: (tabId: string) =>
    set((state) => {
      if (!state.tabData[tabId]) {
        return state;
      }

      const { [tabId]: _removed, ...rest } = state.tabData;
      return { tabData: rest };
    }),
}));

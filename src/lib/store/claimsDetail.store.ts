import { create } from 'zustand';

import { subMonths } from 'date-fns';
import { formatOverviewDate } from './overview.store';

const DEFAULT_POLICY_NUMBER = '';
const DEFAULT_PHONE_NUMBER = '';
const DEFAULT_CLAIM_NUMBER = '';
const DEFAULT_STATUS_GROUPS: string[] = [];
const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 15;
const DEAFULT_FROM_DATE = formatOverviewDate(subMonths(new Date(), 3));
const DEFAULT_TO_DATE = formatOverviewDate(new Date());

type ClaimsDetailStoreState = {
  policyNumber: string;
  statusGroups: string[];
  phoneNumber: string;
  claimNumber: string;
  coverIds: string[];
  coverIdsInitialized: boolean;
  page: number;
  size: number;
  fromDate: string;
  toDate: string;
};

type ClaimsDetailStoreActions = {
  setPolicyNumber: (policyNumber: string) => void;
  setStatusGroups: (statusGroups: string[]) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setClaimNumber: (claimNumber: string) => void;
  setCoverIds: (coverIds: string[]) => void;
  applyCoverIdsFromMapping: (coverIds: string[]) => void;
  markCoverIdsSyncPending: () => void;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  setPagination: (page: number, size: number) => void;
  resetFilters: () => void;
  initializeDefaults: (defaults: Partial<ClaimsDetailStoreState>) => void;
};

export type ClaimsDetailStore = ClaimsDetailStoreState & ClaimsDetailStoreActions;

const DEFAULT_CLAIMS_DETAIL_STATE: ClaimsDetailStoreState = {
  policyNumber: DEFAULT_POLICY_NUMBER,
  statusGroups: [...DEFAULT_STATUS_GROUPS],
  phoneNumber: DEFAULT_PHONE_NUMBER,
  claimNumber: DEFAULT_CLAIM_NUMBER,
  coverIds: [],
  coverIdsInitialized: false,
  page: DEFAULT_PAGE,
  size: DEFAULT_SIZE,
  fromDate: DEAFULT_FROM_DATE,
  toDate: DEFAULT_TO_DATE,
};

export const useClaimsDetailStore = create<ClaimsDetailStore>((set) => ({
  ...DEFAULT_CLAIMS_DETAIL_STATE,
  setPolicyNumber: (policyNumber: string) => set({ policyNumber, page: DEFAULT_PAGE }),
  setStatusGroups: (statusGroups: string[]) => set({ statusGroups, page: DEFAULT_PAGE }),
  setPhoneNumber: (phoneNumber: string) => set({ phoneNumber, page: DEFAULT_PAGE }),
  setClaimNumber: (claimNumber: string) => set({ claimNumber, page: DEFAULT_PAGE }),
  setCoverIds: (coverIds: string[]) => set({ coverIds, page: DEFAULT_PAGE }),
  applyCoverIdsFromMapping: (coverIds: string[]) =>
    set({ coverIds, coverIdsInitialized: true }),
  markCoverIdsSyncPending: () => set({ coverIdsInitialized: false }),
  setPage: (page: number) => set({ page }),
  setSize: (size: number) => set({ size, page: DEFAULT_PAGE }),
  setPagination: (page: number, size: number) => set({ page, size }),
  resetFilters: () => set({ ...DEFAULT_CLAIMS_DETAIL_STATE }),
  initializeDefaults: (defaults: Partial<ClaimsDetailStoreState>) =>
    set((state) => ({
      policyNumber: defaults.policyNumber ?? state.policyNumber,
      statusGroups: defaults.statusGroups ?? state.statusGroups,
      phoneNumber: defaults.phoneNumber ?? state.phoneNumber,
      claimNumber: defaults.claimNumber ?? state.claimNumber,
      coverIds: defaults.coverIds ?? state.coverIds,
      coverIdsInitialized: defaults.coverIdsInitialized ?? state.coverIdsInitialized,
      fromDate: defaults.fromDate ?? state.fromDate,
      toDate: defaults.toDate ?? state.toDate,
      page: defaults.page ?? state.page,
      size: defaults.size ?? state.size,
    })),
}));

import { format, startOfMonth, subMonths } from 'date-fns';
import { create } from 'zustand';
import type { DateRange } from 'react-day-picker';
import { ClaimStatusGroup, GroupBy } from '@/lib/types/overview';
import { DEFAULT_CHART_GROUP_BY } from '@/lib/constants/overview.constants';

export const DEFAULT_OVERVIEW_DATE_RANGE: DateRange = (() => {
  const today = new Date();
  return {
    from: subMonths(today, 1),
    to: today,
  };
})();

export const DEFAULT_OVERVIEW_MONTHLY_DATE_RANGE: DateRange = (() => {
  const today = new Date();
  return {
    from: startOfMonth(today),
    to: today,
  };
})();

export const DEFAULT_OVERVIEW_STATES: OverviewStoreState = {
  groupBy: DEFAULT_CHART_GROUP_BY,
  dateRange: DEFAULT_OVERVIEW_DATE_RANGE,
  claimsTableDateRange: DEFAULT_OVERVIEW_DATE_RANGE,
  statusGroups: ['inprogress', 'paid', 'rejected', 'closed'] as ClaimStatusGroup[],
  coverIds: [] as string[],
  coverIdsInitialized: false,
  page: 1,
  pageSize: 15,
};

export const formatOverviewDate = (date: Date | string): string =>
  typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');

type OverviewStoreState = {
  dateRange: DateRange;
  claimsTableDateRange: DateRange;
  groupBy: GroupBy;
  statusGroups: ClaimStatusGroup[];
  coverIds: string[];
  coverIdsInitialized: boolean;
  page: number;
  pageSize: number;
};

type OverviewStoreActions = {
  setDateRange: (dateRange?: DateRange) => void;
  setGroupBy: (groupBy: GroupBy) => void;
  setClaimsTableDateRange: (dateRange: DateRange) => void;
  setStatusGroups: (statusGroups: ClaimStatusGroup[]) => void;
  setCoverIds: (coverIds: string[]) => void;
  applyCoverIdsFromMapping: (coverIds: string[]) => void;
  markCoverIdsSyncPending: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setPagination: (page: number, pageSize: number) => void;
  resetFilters: () => void;
  initializeDefaults: (defaults: OverviewStoreDefaults) => void;
};

export type OverviewStore = OverviewStoreState & OverviewStoreActions;

export type OverviewStoreDefaults = Partial<
  Pick<
    OverviewStoreState,
    | 'dateRange'
    | 'groupBy'
    | 'claimsTableDateRange'
    | 'statusGroups'
    | 'coverIds'
    | 'coverIdsInitialized'
    | 'page'
    | 'pageSize'
  >
>;

const resolveDefaults = (
  state: OverviewStoreState,
  defaults: OverviewStoreDefaults,
): OverviewStoreState => ({
  dateRange:
    defaults.dateRange?.from && defaults.dateRange?.to ? defaults.dateRange : state.dateRange,
  groupBy: defaults.groupBy ?? state.groupBy,
  claimsTableDateRange:
    defaults.claimsTableDateRange?.from && defaults.claimsTableDateRange?.to
      ? defaults.claimsTableDateRange
      : state.claimsTableDateRange,
  statusGroups: defaults.statusGroups ?? state.statusGroups,
  coverIds: defaults.coverIds ?? state.coverIds,
  coverIdsInitialized: defaults.coverIdsInitialized ?? state.coverIdsInitialized,
  page: defaults.page ?? state.page,
  pageSize: defaults.pageSize ?? state.pageSize,
});

export const useOverviewStore = create<OverviewStore>((set) => ({
  ...DEFAULT_OVERVIEW_STATES,

  setDateRange: (dateRange?: DateRange) =>
    set({
      dateRange: {
        from: dateRange?.from,
        to: dateRange?.to,
      },
      page: 1,
    }),

  setGroupBy: (groupBy: GroupBy) => set({ groupBy, page: 1 }),

  setClaimsTableDateRange: (dateRange: DateRange) => set({ claimsTableDateRange: dateRange }),

  setStatusGroups: (statusGroups: ClaimStatusGroup[]) => set({ statusGroups, page: 1 }),

  setCoverIds: (coverIds: string[]) => set({ coverIds }),

  applyCoverIdsFromMapping: (coverIds: string[]) =>
    set({ coverIds, coverIdsInitialized: true }),

  markCoverIdsSyncPending: () => set({ coverIdsInitialized: false }),

  setPage: (page: number) => set({ page }),

  setPageSize: (pageSize: number) => set({ pageSize, page: 1 }),

  setPagination: (page: number, pageSize: number) => set({ page, pageSize }),

  resetFilters: () => set({ ...DEFAULT_OVERVIEW_STATES, page: 1 }),

  initializeDefaults: (defaults: OverviewStoreDefaults) =>
    set((state) => resolveDefaults(state, defaults)),
}));

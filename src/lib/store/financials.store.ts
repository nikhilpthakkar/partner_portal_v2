import { subMonths } from 'date-fns';
import { create } from 'zustand';
import type { DateRange } from 'react-day-picker';

import type { FinancialTab, LedgerFilters } from '@/lib/types/financials';

export const DEFAULT_FINANCIALS_DATE_RANGE: DateRange = (() => {
  const today = new Date();
  return {
    from: subMonths(today, 1),
    to: today,
  };
})();

type FinancialsStoreState = {
  activeTab: FinancialTab;
  selectedRows: Set<string>;
  page: number;
  pageSize: number;
  filters: LedgerFilters;
  isDisputeModalOpen: boolean;
};

type FinancialsStoreActions = {
  setActiveTab: (tab: FinancialTab) => void;
  setSelectedRows: (rows: Set<string>) => void;
  clearSelection: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: Partial<LedgerFilters>) => void;
  setDateRange: (dateRange?: DateRange) => void;
  setSearchUtr: (utr: string) => void;
  setAggregateBy: (agg: LedgerFilters['aggregateBy']) => void;
  openDisputeModal: () => void;
  closeDisputeModal: () => void;
};

export type FinancialsStore = FinancialsStoreState & FinancialsStoreActions;

const DEFAULT_FILTERS: LedgerFilters = {
  dateRange: DEFAULT_FINANCIALS_DATE_RANGE,
  aggregateBy: 'Month',
  searchUtr: '',
};

export const useFinancialsStore = create<FinancialsStore>((set) => ({
  activeTab: 'ledger_summary',
  selectedRows: new Set<string>(),
  page: 1,
  pageSize: 15,
  filters: DEFAULT_FILTERS,
  isDisputeModalOpen: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedRows: (rows) => set({ selectedRows: rows }),

  clearSelection: () => set({ selectedRows: new Set<string>() }),

  setPage: (page) => set({ page }),

  setPageSize: (size) => set({ pageSize: size, page: 1 }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1,
    })),

  setDateRange: (dateRange) =>
    set((state) => ({
      filters: {
        ...state.filters,
        dateRange: {
          from: dateRange?.from,
          to: dateRange?.to,
        },
      },
      page: 1,
    })),

  setSearchUtr: (utr) =>
    set((state) => ({
      filters: { ...state.filters, searchUtr: utr },
      page: 1,
    })),

  setAggregateBy: (agg) =>
    set((state) => ({
      filters: { ...state.filters, aggregateBy: agg },
      page: 1,
      selectedRows: new Set<string>(),
    })),

  openDisputeModal: () => set({ isDisputeModalOpen: true }),

  closeDisputeModal: () => set({ isDisputeModalOpen: false }),
}));

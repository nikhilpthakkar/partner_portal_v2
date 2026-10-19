import { create } from 'zustand';
import { Permission } from '@/lib/constants/auth.constants';
import { DEFAULT_DATA_SOURCE, type DataSource } from '@/lib/constants/global.constants';

type PartnerStoreState = {
  partnerId: string;
  lob: string;
  productIds: string[];
  dataSource: DataSource;
  permissions: Permission[];
  partnerOptions: Array<{ label: string; value: string }>;
  lobOptions: Array<{ label: string; value: string }>;
  productOptions: Array<{ label: string; value: string }>;
};

type PartnerStoreActions = {
  setPartnerId: (partnerId: string) => void;
  setLob: (lob: string) => void;
  setProductIds: (productIds: string[]) => void;
  setDataSource: (dataSource: DataSource) => void;
  setPermissions: (permissions: Permission[]) => void;
  setPartnerOptions: (partnerOptions: Array<{ label: string; value: string }>) => void;
  setLobOptions: (lobOptions: Array<{ label: string; value: string }>) => void;
  setProductOptions: (productOptions: Array<{ label: string; value: string }>) => void;
  initializeDefaults: (defaults: Partial<PartnerStoreState>) => void;
};

export type PartnerStore = PartnerStoreState & PartnerStoreActions;

export const usePartnerStore = create<PartnerStore>((set) => ({
  partnerId: '',
  lob: '',
  partnerOptions: [],
  lobOptions: [],
  productOptions: [],
  productIds: [],
  dataSource: DEFAULT_DATA_SOURCE,
  permissions: [],
  setProductIds: (productIds: string[]) => set({ productIds }),
  setDataSource: (dataSource: DataSource) => set({ dataSource }),
  setPermissions: (permissions: Permission[]) => set({ permissions }),
  setPartnerId: (partnerId: string) => set({ partnerId }),
  setLob: (lob: string) => set({ lob }),
  setPartnerOptions: (partnerOptions: Array<{ label: string; value: string }>) =>
    set({ partnerOptions }),
  setLobOptions: (lobOptions: Array<{ label: string; value: string }>) => set({ lobOptions }),
  setProductOptions: (productOptions: Array<{ label: string; value: string }>) =>
    set({ productOptions }),
  initializeDefaults: (defaults: Partial<PartnerStoreState>) =>
    set((state) => ({
      partnerId: defaults.partnerId ?? state.partnerId,
      lob: defaults.lob ?? state.lob,
      partnerOptions: defaults.partnerOptions ?? state.partnerOptions,
      lobOptions: defaults.lobOptions ?? state.lobOptions,
      productOptions: defaults.productOptions ?? state.productOptions,
      dataSource: defaults.dataSource ?? state.dataSource,
      permissions: defaults.permissions ?? state.permissions,
    })),
}));

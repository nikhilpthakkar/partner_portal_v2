import { create } from 'zustand';

type GlobalLoaderStoreState = {
  isLoading: boolean;
  message?: string;
};

type GlobalLoaderStoreActions = {
  showLoader: (message?: string) => void;
  hideLoader: () => void;
};

export type GlobalLoaderStore = GlobalLoaderStoreState & GlobalLoaderStoreActions;

export const useGlobalLoaderStore = create<GlobalLoaderStore>((set) => ({
  isLoading: false,
  message: undefined,
  showLoader: (message?: string) => set({ isLoading: true, message }),
  hideLoader: () => set({ isLoading: false, message: undefined }),
}));

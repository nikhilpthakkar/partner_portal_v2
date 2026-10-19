import { create } from 'zustand';
import type { UserProfile } from '@/lib/types/userProfile';

type UserProfileStoreState = {
  userProfile: UserProfile | null;
  isLoading: boolean;
};

type UserProfileStoreActions = {
  setUserProfile: (userProfile: UserProfile) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearUserProfile: () => void;
};

export type UserProfileStore = UserProfileStoreState & UserProfileStoreActions;

export const useUserProfileStore = create<UserProfileStore>((set) => ({
  userProfile: null,
  isLoading: true,
  setUserProfile: (userProfile: UserProfile) => set({ userProfile }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  clearUserProfile: () => set({ userProfile: null }),
}));

import { mapUserProfile } from '@/lib/adapter/user-profile/userProfile.adapter';
import { apiClient } from '@/lib/services/axios-client/apiClient';
import { useUserProfileStore } from '@/lib/store/userProfile.store';
import type { UserProfile, UserProfileApiResponse } from '@/lib/types/userProfile';

export const fetchUserProfile = async (): Promise<UserProfile> => {
  return await apiClient
    .get<UserProfileApiResponse>('/user/profile')
    .then((response) => {
      const userProfile = mapUserProfile(response.data);
      useUserProfileStore.getState().setUserProfile(userProfile);
      return userProfile;
    });
};

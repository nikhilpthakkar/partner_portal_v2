import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/lib/context/AuthContext';
import { fetchUserProfile } from '@/lib/services/user-profile/api';

export const USER_PROFILE_QUERY_KEY = ['user-profile'];

type UseUserProfileQueryParams = {
  enabled?: boolean;
};

export const useUserProfileQuery = ({ enabled = true }: UseUserProfileQueryParams = {}) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: fetchUserProfile,
    enabled: isAuthenticated && enabled,
    staleTime: 10 * 60 * 1000,
  });
};

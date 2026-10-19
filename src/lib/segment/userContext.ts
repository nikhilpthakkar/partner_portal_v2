import { useUserProfileStore } from '@/lib/store/userProfile.store';
import type { SegmentUserContext, SegmentUserType } from '@/lib/types/segment.payloads';

const INTERNAL_EMAIL_DOMAINS = new Set(['acko.com', 'acko.tech']);
const PROFILE_WAIT_TIMEOUT_MS = 8000;

export const getSegmentUserTypeFromEmail = (email: string): SegmentUserType => {
  const domain = email.trim().split('@')[1]?.toLowerCase();
  if (!domain) {
    return 'external';
  }

  return INTERNAL_EMAIL_DOMAINS.has(domain) ? 'internal' : 'external';
};

export const getSegmentUserContext = (): SegmentUserContext => {
  const userProfile = useUserProfileStore.getState().userProfile;
  const userName = `${userProfile?.firstName ?? ''} ${userProfile?.lastName ?? ''}`.trim();
  const userEmail = userProfile?.email?.trim() ?? '';

  return {
    user_name: userName,
    user_email: userEmail,
    user_type: getSegmentUserTypeFromEmail(userEmail),
  };
};

export const waitForSegmentUserContext = (): Promise<void> => {
  const { userProfile, isLoading } = useUserProfileStore.getState();
  if (userProfile || !isLoading) {
    return Promise.resolve();
  }

  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      unsubscribe();
      resolve();
    }, PROFILE_WAIT_TIMEOUT_MS);

    const unsubscribe = useUserProfileStore.subscribe((state) => {
      if (state.userProfile || !state.isLoading) {
        window.clearTimeout(timeoutId);
        unsubscribe();
        resolve();
      }
    });
  });
};

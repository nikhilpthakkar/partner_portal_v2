import axios from 'axios';
import { toast } from 'sonner';
import { removeAccessToken } from '@/lib/utils/auth';
import { getLoginUrl } from '@/lib/utils/environment';
import { ERROR_MESSAGES, ERROR_TITLES } from '@/lib/constants/genericMessages.constants';
import { getDomainOrigin } from '@/lib/services/serverConfig';
import { useGlobalLoaderStore } from '@/lib/store/globalLoader.store';
import { GLOBAL_LOADER_MESSAGES } from '@/lib/constants/auth.constants';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const REDIRECT_DELAY_MS = 2000;
const SESSION_EXPIRED_TOAST_ID = 'session-expired';

export const axiosInstance = axios.create({
  baseURL: `${getDomainOrigin()}${BASE_PATH}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let currentTenant = '';
let isSessionExpiredHandling = false;

axiosInstance.interceptors.request.use(
  (config) => {
    config.headers = config.headers ?? {};

    if (currentTenant) {
      config.headers['x-Acko-Tenant'] = currentTenant;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAccessToken();

      if (typeof window !== 'undefined' && !isSessionExpiredHandling) {
        isSessionExpiredHandling = true;

        useGlobalLoaderStore.getState().showLoader(GLOBAL_LOADER_MESSAGES.LOGIN_REDIRECT_LOADING);

        toast.error(ERROR_TITLES.SESSION_EXPIRED_TITLE, {
          id: SESSION_EXPIRED_TOAST_ID,
          duration: REDIRECT_DELAY_MS,
          description: ERROR_MESSAGES.SESSION_EXPIRED,
        });

        window.setTimeout(() => {
          window.location.href = getLoginUrl();
        }, REDIRECT_DELAY_MS);
      }

      throw error;
    }

    return Promise.reject(error);
  },
);

export const updateTenantHeader = (tenant: string) => {
  currentTenant = tenant;
};

export const resetSessionExpiredHandling = () => {
  isSessionExpiredHandling = false;
};

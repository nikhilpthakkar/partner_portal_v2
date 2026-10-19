import Cookies, { type CookieAttributes } from 'js-cookie';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants/auth.constants';
import {
  getUserIdCookieDomains,
  getUserIdCookiePaths,
  USER_ID_COOKIE_NAME,
} from '@/lib/utils/user-id-cookie';

export const ACKO_DOMAIN_USER_ID_COOKIE = USER_ID_COOKIE_NAME;

function getSharedAckoCookieOptions(): CookieAttributes {
  const options: CookieAttributes = {
    expires: 7,
    secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : true,
    sameSite: 'strict',
  };

  if (typeof window === 'undefined') {
    return options;
  }

  const hostname = window.location.hostname;
  const sharedDomain = getUserIdCookieDomains(hostname).find((domain): domain is string =>
    Boolean(domain),
  );
  if (sharedDomain) {
    options.domain = sharedDomain;
  }

  return options;
}

function getCookiePaths(): string[] {
  if (typeof window === 'undefined') {
    return ['/'];
  }

  return getUserIdCookiePaths(window.location.pathname);
}

export function removeUserIdCookie(): void {
  if (!Cookies.get(ACKO_DOMAIN_USER_ID_COOKIE)) {
    return;
  }

  const options = getSharedAckoCookieOptions();
  const paths = getCookiePaths();

  paths.forEach((path) => {
    Cookies.remove(ACKO_DOMAIN_USER_ID_COOKIE, { ...options, path });
    Cookies.remove(ACKO_DOMAIN_USER_ID_COOKIE, { ...options, domain: undefined, path });

    if (typeof window !== 'undefined') {
      Cookies.remove(ACKO_DOMAIN_USER_ID_COOKIE, {
        ...options,
        domain: window.location.hostname,
        path,
      });
    }
  });
}

export function storeAccessToken(token: string, refreshToken: string): void {
  Cookies.set(ACCESS_TOKEN_KEY, token, {
    expires: 7,
    secure: true,
    sameSite: 'strict',
  });
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    expires: 7,
    secure: true,
    sameSite: 'strict',
  });
}

export function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

export function removeAccessToken(): void {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
  removeUserIdCookie();
}

export function isAuthenticated(): boolean {
  const token = getAccessToken();
  const refreshToken = getRefreshToken();
  return !!token && token.length > 0 && !!refreshToken && refreshToken.length > 0;
}

export function extractAuthCodeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('code');
}

export function cleanAuthCodeFromUrl(): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.delete('code');
  window.history.replaceState({}, document.title, url.toString());
}

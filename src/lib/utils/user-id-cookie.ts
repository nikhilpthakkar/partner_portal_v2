export const USER_ID_COOKIE_NAME = 'user_id';

export const USER_ID_COOKIE_PATHS = [
  '/',
  '/external',
  '/external/api',
  '/external/api/v2',
  '/external/api/v2/send',
];

type ResponseWithHeaders = {
  headers: {
    append(name: string, value: string): void;
  };
};

export function getUserIdCookieDomains(hostname: string): Array<string | undefined> {
  const domains: Array<string | undefined> = [undefined];

  if (hostname.endsWith('ackolife.com')) {
    domains.push('.ackolife.com');
  } else if (hostname.endsWith('ackodev.com')) {
    domains.push('.ackodev.com');
  } else if (hostname.endsWith('acko.com')) {
    domains.push('.acko.com');
  }

  return domains;
}

export function getUserIdCookiePaths(pathname: string): string[] {
  const paths = new Set<string>(USER_ID_COOKIE_PATHS);
  let currentPath = '';

  pathname
    .split('/')
    .filter(Boolean)
    .forEach((pathSegment) => {
      currentPath += `/${pathSegment}`;
      paths.add(currentPath);
    });

  return Array.from(paths);
}

export function hasUserIdCookie(cookieHeader: string | null | undefined): boolean {
  return (
    cookieHeader
      ?.split(';')
      .map((cookie) => cookie.trim())
      .some((cookie) => cookie.split('=')[0] === USER_ID_COOKIE_NAME) ?? false
  );
}

export function removeUserIdCookieFromHeader(cookieHeader: string): string {
  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.split('=')[0] !== USER_ID_COOKIE_NAME)
    .join('; ');
}

export function appendClearUserIdCookieHeaders<TResponse extends ResponseWithHeaders>(
  response: TResponse,
  hostname: string,
  pathname: string,
): TResponse {
  getUserIdCookieDomains(hostname).forEach((domain) => {
    getUserIdCookiePaths(pathname).forEach((path) => {
      let cookie = `${USER_ID_COOKIE_NAME}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${path}`;
      if (domain) {
        cookie += `; Domain=${domain}`;
      }

      response.headers.append('Set-Cookie', cookie);
    });
  });

  return response;
}

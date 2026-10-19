import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { FINANCIAL_SIMULATOR_ENABLED } from '@/features/financial-workspace/config';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants/auth.constants';
import { appendClearUserIdCookieHeaders, USER_ID_COOKIE_NAME } from '@/lib/utils/user-id-cookie';

function clearUserIdCookie(response: NextResponse, request: NextRequest): NextResponse {
  if (!request.cookies.get(USER_ID_COOKIE_NAME)) {
    return response;
  }

  return appendClearUserIdCookieHeaders(
    response,
    request.nextUrl.hostname,
    request.nextUrl.pathname,
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    FINANCIAL_SIMULATOR_ENABLED &&
    ['localhost', '127.0.0.1', '[::1]'].includes(request.nextUrl.hostname)
  ) {
    return NextResponse.next();
  }

  if (pathname === '/' || pathname.startsWith('/external/')) {
    return clearUserIdCookie(NextResponse.next(), request);
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  if (
    !accessToken ||
    !refreshToken ||
    (accessToken?.length && accessToken?.length === 0) ||
    (refreshToken?.length && refreshToken?.length === 0)
  ) {
    return clearUserIdCookie(NextResponse.redirect(new URL('/', request.url)), request);
  }

  return clearUserIdCookie(NextResponse.next(), request);
}

export const config = {
  matcher: ['/((?!api|external|_next/static|_next/image|favicon.ico|images).*)'],
};

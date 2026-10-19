import { NextRequest, NextResponse } from 'next/server';
import {
  appendClearUserIdCookieHeaders,
  hasUserIdCookie,
  removeUserIdCookieFromHeader,
} from '@/lib/utils/user-id-cookie';

const getUpstreamOrigin = (): string => {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:9001';
  }

  const isProduction = process.env.NEXT_PUBLIC_ENV === 'production';
  const isLifeProd = process.env.NEXT_PUBLIC_DEPLOYMENT_TARGET === 'life-prod';
  if (isLifeProd) {
    return 'https://partner-portal.ackolife.com';
  }

  return isProduction ? 'https://partner-portal.acko.com' : 'https://partner-portal.ackodev.com';
};

const clearUserIdCookie = (response: NextResponse, request: NextRequest): NextResponse => {
  if (!hasUserIdCookie(request.headers.get('cookie'))) {
    return response;
  }

  return appendClearUserIdCookieHeaders(
    response,
    request.nextUrl.hostname,
    request.nextUrl.pathname,
  );
};

export async function POST(request: NextRequest) {
  const upstreamUrl = `${getUpstreamOrigin()}/external/api/v2/send`;
  const headers = new Headers();
  const cookie = request.headers.get('cookie');
  const contentType = request.headers.get('content-type');
  const writeKey = request.headers.get('x-write-key');

  if (cookie) {
    const cookieWithoutUserId = removeUserIdCookieFromHeader(cookie);
    if (cookieWithoutUserId) {
      headers.set('cookie', cookieWithoutUserId);
    }
  }
  if (contentType) {
    headers.set('content-type', contentType);
  }
  if (writeKey) {
    headers.set('x-write-key', writeKey);
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers,
      body: await request.arrayBuffer(),
      redirect: 'manual',
    });

    return clearUserIdCookie(
      new NextResponse(await upstream.arrayBuffer(), {
        status: upstream.status,
        headers: {
          'content-type': upstream.headers.get('content-type') ?? 'application/json',
        },
      }),
      request,
    );
  } catch {
    return clearUserIdCookie(
      NextResponse.json({ error: 'Unable to send analytics event' }, { status: 502 }),
      request,
    );
  }
}

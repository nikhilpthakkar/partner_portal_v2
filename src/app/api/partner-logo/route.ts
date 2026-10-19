import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOST_SUFFIXES = ['.acko.com', '.ackodev.com'];

const getAllowedLogoUrl = (raw: string): URL | null => {
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') {
      return null;
    }

    const hostname = url.hostname.toLowerCase();
    const isAllowed = ALLOWED_HOST_SUFFIXES.some(
      (suffix) => hostname === suffix.slice(1) || hostname.endsWith(suffix),
    );

    return isAllowed ? url : null;
  } catch {
    return null;
  }
};

const isSvgPayload = (url: URL, bytes: Uint8Array): boolean => {
  if (url.pathname.toLowerCase().endsWith('.svg')) {
    return true;
  }

  const head = new TextDecoder().decode(bytes.slice(0, 512)).trim().toLowerCase();
  return head.startsWith('<svg') || head.includes('<svg');
};

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url');
  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  const logoUrl = getAllowedLogoUrl(rawUrl);
  if (!logoUrl) {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  const upstream = await fetch(rawUrl);
  if (!upstream.ok) {
    return NextResponse.json({ error: 'Unable to load logo' }, { status: 502 });
  }

  const buffer = await upstream.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const svg = isSvgPayload(logoUrl, bytes);
  const upstreamType = upstream.headers.get('content-type') ?? '';

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': svg
        ? 'image/svg+xml; charset=utf-8'
        : upstreamType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=3600',
      'Content-Disposition': 'inline',
    },
  });
}

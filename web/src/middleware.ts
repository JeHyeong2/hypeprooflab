import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // H3: CSRF protection — check Origin header on POST requests
  if (request.method === 'POST') {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const nextAuthUrl = process.env.NEXTAUTH_URL;

    // Allow if origin matches host or NEXTAUTH_URL
    const allowedOrigins = new Set<string>();
    if (nextAuthUrl) {
      try {
        allowedOrigins.add(new URL(nextAuthUrl).origin);
      } catch { /* ignore parse errors */ }
    }
    if (host) {
      allowedOrigins.add(`https://${host}`);
      allowedOrigins.add(`http://${host}`);
    }

    // Skip CSRF check for auth routes (NextAuth handles its own CSRF)
    const isAuthRoute = request.nextUrl.pathname.startsWith('/api/auth/');

    if (!isAuthRoute && origin && !allowedOrigins.has(origin)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};

import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getSecretKey(): Uint8Array | null {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret || secret.trim().length === 0) {
    console.error('[CRITICAL SECURITY] ADMIN_SECRET_KEY is mandatory in middleware and missing from environment.');
    return null;
  }
  return new TextEncoder().encode(secret.trim());
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin dashboard and orders routes
  if (pathname.startsWith('/admin/dashboard') || pathname.startsWith('/admin/orders')) {
    const token = request.cookies.get('ss_admin_session')?.value;

    if (!token) {
      const loginUrl = new URL('/admin', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const secretKey = getSecretKey();
    if (!secretKey) {
      const response = NextResponse.redirect(new URL('/admin?error=auth_misconfigured', request.url));
      response.cookies.delete('ss_admin_session');
      return response;
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin?error=unauthorized', request.url));
      }
    } catch (err) {
      const response = NextResponse.redirect(new URL('/admin?error=expired', request.url));
      response.cookies.delete('ss_admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/admin/orders/:path*', '/admin/orders'],
};


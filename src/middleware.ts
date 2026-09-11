import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.ADMIN_SECRET_KEY || 'ss_production_master_secret_2026_super_secure_key_9791719662'
);

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

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
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


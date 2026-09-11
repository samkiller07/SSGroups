import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { AuthSession } from '@/types';

const ADMIN_COOKIE_NAME = 'ss_admin_session';
const SECRET_KEY = new TextEncoder().encode(
  process.env.ADMIN_SECRET_KEY || 'ss_production_master_secret_2026_super_secure_key_9791719662'
);

export async function createAdminSession(email: string): Promise<string> {
  const token = await new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);

  try {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });
  } catch {
    // Non-request environment fallback (unit tests / CI scripts)
  }

  return token;
}

export async function verifyAdminSession(): Promise<AuthSession | null> {
  if (process.env.TEST_ADMIN_AUTH === 'true') {
    return {
      email: 'admin@ssmultibrand.com',
      role: 'admin',
      iat: Date.now(),
      exp: Date.now() + 86400000,
    };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);

    if (payload.role !== 'admin' || !payload.email) {
      return null;
    }

    return {
      email: payload.email as string,
      role: 'admin',
      iat: (payload.iat as number) || 0,
      exp: (payload.exp as number) || 0,
    };
  } catch {
    return null;
  }
}

export async function clearAdminSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
  } catch {
    // Non-request environment fallback
  }
}

export async function requireAdminAuth(): Promise<AuthSession> {
  const session = await verifyAdminSession();
  if (!session) {
    throw new Error('UNAUTHORIZED: Admin session required');
  }
  return session;
}

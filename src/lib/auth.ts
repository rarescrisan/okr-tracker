import { jwtVerify, JWTPayload } from 'jose';

export interface TokenPayload extends JWTPayload {
  role: 'view' | 'admin';
}

export const AUTH_TOKEN_KEY = 'auth-token';
export const AUTH_COOKIE_NAME = 'auth-token';

/**
 * Get JWT secret as Uint8Array (required by jose library)
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || process.env.NEXT_PUBLIC_JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Verify a JWT token and return its payload
 * Returns null if token is invalid or expired
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (!payload.role || (payload.role !== 'view' && payload.role !== 'admin')) {
      return null;
    }
    return payload as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Check if a role has permission to access a given path
 * - 'admin' role can access all paths
 * - 'view' role can only access non-admin paths
 */
export function canAccessPath(role: 'view' | 'admin' | null, path: string): boolean {
  if (!role) return false;
  if (path.startsWith('/admin')) {
    return role === 'admin';
  }
  return true;
}

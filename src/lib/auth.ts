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
 * BYPASSED: Always returns admin role without token verification
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  // Bypass authentication - always return admin role
  return {
    role: 'admin'
  } as TokenPayload;
}

/**
 * Check if a role has permission to access a given path
 * - 'admin' role can access all paths
 * - 'view' role can only access non-admin paths
 * BYPASSED: Always returns true - all paths accessible
 */
export function canAccessPath(_role: 'view' | 'admin' | null, _path: string): boolean {
  // Bypass authentication - always allow access
  return true;
}

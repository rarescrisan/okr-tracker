'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const AUTH_TOKEN_KEY = 'auth-token';
const AUTH_COOKIE_NAME = 'auth-token';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: 'view' | 'admin' | null;
  logout: () => void;
}

interface VerifyResponse {
  valid: boolean;
  role?: 'view' | 'admin';
  error?: string;
}

async function verifyTokenViaApi(token: string): Promise<VerifyResponse> {
  try {
    const response = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return await response.json();
  } catch {
    return { valid: false, error: 'Network error' };
  }
}

function canAccessPath(role: 'view' | 'admin' | null, path: string): boolean {
  // BYPASSED: Always allow access
  return true;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<'view' | 'admin' | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    setRole(null);
    router.replace('/');
  }, [router]);

  useEffect(() => {
    // BYPASSED: Always set admin role without token verification
    setRole('admin');
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && role && !canAccessPath(role, pathname)) {
      router.replace('/okr');
    }
  }, [isLoading, role, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!role,
        isLoading,
        role,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

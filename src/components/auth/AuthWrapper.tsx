'use client';

import { Suspense } from 'react';
import { AuthProvider } from '@/src/contexts/AuthContext';
import { AuthGuard } from './AuthGuard';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#f6f8f9] flex items-center justify-center">
      <div className="text-[#6d6e6f]">Loading...</div>
    </div>
  );
}

function AuthProviderWithSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthProvider>
        <AuthGuard>{children}</AuthGuard>
      </AuthProvider>
    </Suspense>
  );
}

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProviderWithSuspense>{children}</AuthProviderWithSuspense>;
}

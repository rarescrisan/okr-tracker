'use client';

import { useAuth } from '@/src/contexts/AuthContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8f9] flex items-center justify-center">
        <div className="text-[#6d6e6f]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f6f8f9] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-[#e8e8e8] p-8 text-center">
          <div className="text-5xl mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-16 h-16 mx-auto text-[#6d6e6f]"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#1e1f21] mb-2">
            Authentication Required
          </h1>
          <p className="text-[#6d6e6f]">
            Please use a valid token link to access this application.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

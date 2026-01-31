'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function HomeRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Preserve token when redirecting
      router.replace(`/okr?token=${token}`);
    } else {
      router.replace('/okr');
    }
  }, [router, searchParams]);

  return null;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f8f9] flex items-center justify-center">
      <div className="text-[#6d6e6f]">Loading...</div>
      <Suspense fallback={null}>
        <HomeRedirect />
      </Suspense>
    </div>
  );
}

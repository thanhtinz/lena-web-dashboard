'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GiveawaysRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-slate-400">Redirecting to dashboard...</p>
    </div>
  );
}

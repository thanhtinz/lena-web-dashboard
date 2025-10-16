'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResponsesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return null;
}

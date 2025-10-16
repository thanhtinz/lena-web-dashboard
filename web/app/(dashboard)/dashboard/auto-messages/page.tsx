'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AutoMessagesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return null;
}

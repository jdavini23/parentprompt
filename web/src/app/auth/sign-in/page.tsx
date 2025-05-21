'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignInRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');

  useEffect(() => {
    const path = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';
    router.replace(path);
  }, [router, redirect]);

  return null;
}

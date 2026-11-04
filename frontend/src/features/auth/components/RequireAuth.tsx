'use client';

import { useAuth } from '@/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

export function RequireAuth({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  // The single place that sends logged-out users to /login. It also covers logout and expired sessions,
  // because both end up as status "unauthenticated"
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  // Children are not mounted until the user is known to be authenticated,
  // so no page fires a data request that is bound to fail with 401
  if (status !== 'authenticated') {
    return <p className="text-sm">Loading...</p>;
  }

  return <>{children}</>;
}

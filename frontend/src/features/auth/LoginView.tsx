'use client';

import { useAuth } from '@/providers/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import type { LoginFormValues } from './loginForm';

export function LoginView() {
  const router = useRouter();
  const { status, sessionExpired, login } = useAuth();

  // Single place that handles the redirect: runs after a successful login,
  // and also when an already logged-in user opens /login
  useEffect(() => {
    if (status === 'authenticated') router.replace('/students');
  }, [status, router]);

  async function handleSubmit(values: LoginFormValues) {
    await login(values);
  }

  if (status === 'loading' || status === 'authenticated') {
    return <p className="text-sm">Loading...</p>;
  }

  return (
    <section className="mx-auto max-w-sm">
      <h1 className="mb-4 text-2xl font-bold">Sign in</h1>

      {sessionExpired && (
        <p role="status" className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Your session has ended. Please sign in again.
        </p>
      )}

      <LoginForm onSubmit={handleSubmit} />

      <p className="mt-4 text-xs text-gray-500">
        Accounts are created by an administrator. Ask your admin if you need access.
      </p>
    </section>
  );
}

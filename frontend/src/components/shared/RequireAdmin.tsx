'use client';

import { useAuth } from '@/providers/auth-context';
import Link from 'next/link';
import type { ReactNode } from 'react';

// Page-level gate. These pages sit inside the (protected) layout, so the user is already logged in
// by the time this renders. Children are not mounted for teachers, so the edit page never
// requests data it would not be allowed to change
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div
        role="alert"
        className="max-w-xl rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 mx-auto"
      >
        <p className="font-medium">You do not have permission to view this page.</p>
        <p className="mt-1">Only administrators can add or change records.</p>
        <Link href="/students" className="mt-3 inline-block underline">
          Back to students
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import { useAuth } from '@/providers/auth-context';
import type { ReactNode } from 'react';

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// Inline gate: hides small pieces of UI (buttons, links) from non-admins
export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { isAdmin } = useAuth();
  return <>{isAdmin ? children : fallback}</>;
}

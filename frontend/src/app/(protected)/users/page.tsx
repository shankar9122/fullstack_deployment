import { RequireAdmin } from '@/components/shared/RequireAdmin';
import { UsersView } from '@/features/users/UsersView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Users | School Admin' };

export default function UsersPage() {
  return (
    <RequireAdmin>
      <UsersView />
    </RequireAdmin>
  );
}

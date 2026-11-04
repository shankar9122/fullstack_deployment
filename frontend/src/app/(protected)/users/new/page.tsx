import { RequireAdmin } from '@/components/shared/RequireAdmin';
import { CreateUserView } from '@/features/users/CreateUserView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Add user | School Admin' };

export default function NewUserPage() {
  return (
    <RequireAdmin>
      <CreateUserView />
    </RequireAdmin>
  );
}

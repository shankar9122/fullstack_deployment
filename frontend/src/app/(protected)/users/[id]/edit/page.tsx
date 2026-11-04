import { RequireAdmin } from '@/components/shared/RequireAdmin';
import { EditUserView } from '@/features/users/EditUserView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit user | School Admin' };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // params is a Promise in recent Next.js versions
  return (
    <RequireAdmin>
      <EditUserView id={id} />
    </RequireAdmin>
  );
}

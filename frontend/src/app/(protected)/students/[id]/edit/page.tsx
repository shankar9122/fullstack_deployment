import { RequireAdmin } from '@/components/shared/RequireAdmin';
import { EditStudentView } from '@/features/students/EditStudentView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit student | School Admin' };

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // params is a Promise in recent Next.js versions
  return (
    <RequireAdmin>
      <EditStudentView id={id} />
    </RequireAdmin>
  );
}

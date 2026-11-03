import { RequireAdmin } from '@/components/shared/RequireAdmin';
import { CreateStudentView } from '@/features/students/CreateStudentView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Add student | School Admin' };

export default function NewStudentPage() {
  return (
    <RequireAdmin>
      <CreateStudentView />
    </RequireAdmin>
  );
}

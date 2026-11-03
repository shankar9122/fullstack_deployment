import { RequireAdmin } from '@/components/shared/RequireAdmin';
import { CreateTeacherView } from '@/features/teachers/CreateTeacherView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Add teacher | School Admin' };

export default function NewTeacherPage() {
  return (
    <RequireAdmin>
      <CreateTeacherView />
    </RequireAdmin>
  );
}

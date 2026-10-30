import { EditTeacherView } from '@/features/teachers/EditTeacherView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit teacher | School Admin' };

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // params is a Promise in recent Next.js versions
  return <EditTeacherView id={id} />;
}

import { EditClassView } from '@/features/classes/EditClassView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit class | School Admin' };

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // params is a Promise in recent Next.js versions
  return <EditClassView id={id} />;
}

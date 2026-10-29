import { EditStudentView } from '@/features/students/EditStudentView';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'Edit student | School Admin' };

interface PageProps {
  params: Promise<{ id: string }>;
}

async function EditStudentPageContent({ params }: PageProps) {
  const { id } = await params;
  return <EditStudentView id={id} />;
}

export default function EditStudentPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div>Loading student editor...</div>}>
      <EditStudentPageContent params={params} />
    </Suspense>
  );
}

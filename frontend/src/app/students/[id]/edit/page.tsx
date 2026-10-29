import { EditStudentView } from '@/features/students/EditStudentView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit student | School Admin' };

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Next.js 15/16 mein params ek Promise hai
  return <EditStudentView id={id} />;
}

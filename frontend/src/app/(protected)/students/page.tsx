import { StudentsView } from '@/features/students/StudentsView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Students | School Admin' };

export default function StudentsPage() {
  return <StudentsView />;
}

import { ClassesView } from '@/features/classes/ClassesView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Classes | School Admin' };

export default function ClassesPage() {
  return <ClassesView />;
}

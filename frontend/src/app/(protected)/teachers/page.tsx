import { TeachersView } from '@/features/teachers/TeachersView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Teachers | School Admin' };

export default function TeachersPage() {
  return <TeachersView />;
}

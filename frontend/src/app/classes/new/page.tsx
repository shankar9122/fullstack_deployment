import { CreateClassView } from '@/features/classes/CreateClassView';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Add class | School Admin' };

export default function NewClassPage() {
  return <CreateClassView />;
}

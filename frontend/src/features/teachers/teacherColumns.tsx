import type { Column } from '@/components/shared/DataTable';
import type { Teacher } from '@/types/teacher';

export const teacherColumns: Column<Teacher>[] = [
  { key: 'name', header: 'Name', cell: (teacher) => teacher.name },
  { key: 'subject', header: 'Subject', cell: (teacher) => teacher.subject },
  { key: 'email', header: 'Email', cell: (teacher) => teacher.email },
  { key: 'phone', header: 'Phone', cell: (teacher) => teacher.phone ?? '-' },
];

import type { Column } from '@/components/shared/DataTable';
import type { ClassItem } from '@/types/class';

export const classColumns: Column<ClassItem>[] = [
  {
    key: 'class',
    header: 'Class',
    cell: (item) => `${item.name}-${item.section}`,
  },
  { key: 'academicYear', header: 'Academic year', cell: (item) => item.academicYear },
  {
    key: 'classTeacher',
    header: 'Class teacher',
    cell: (item) => item.classTeacher?.name ?? <span className="text-gray-500">Not assigned</span>,
  },
  { key: 'subject', header: 'Subject', cell: (item) => item.classTeacher?.subject ?? '-' },
];

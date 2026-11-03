import type { Column } from '@/components/shared/DataTable';
import type { Student } from '@/types/student';

export const studentColumns: Column<Student>[] = [
  { key: 'rollNumber', header: 'Roll', cell: (student) => student.rollNumber },
  { key: 'name', header: 'Name', cell: (student) => student.name },
  {
    key: 'class',
    header: 'Class',
    cell: (student) => `${student.class.name}-${student.class.section}`,
  },
  { key: 'gender', header: 'Gender', cell: (student) => student.gender ?? '-' },
  { key: 'guardian', header: 'Guardian', cell: (student) => student.guardianName },
];

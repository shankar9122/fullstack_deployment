import type { Column } from '@/components/shared/DataTable';
import { Avatar } from '@/components/ui/Avatar';
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
  {
    key: 'name',
    header: 'Name',
    cell: (student) => (
      <div className="flex items-center gap-3">
        <Avatar name={student.name} src={student.photoUrl} size={32} />
        <span>{student.name}</span>
      </div>
    ),
  },
];

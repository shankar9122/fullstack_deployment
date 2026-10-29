import { Button } from '@/components/ui/Button';
import type { Student } from '@/types/student';
import Link from 'next/link';

interface StudentsTableProps {
  students: Student[];
  deletingId: string | null;
  onDelete: (student: Student) => void;
}

export function StudentsTable({ students, deletingId, onDelete }: StudentsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Roll</th>
            <th className="p-2">Name</th>
            <th className="p-2">Class</th>
            <th className="p-2">Gender</th>
            <th className="p-2">Guardian</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id} className="border-b">
              <td className="p-2">{student.rollNumber}</td>
              <td className="p-2">{student.name}</td>
              <td className="p-2">
                {student.class.name}-{student.class.section}
              </td>
              <td className="p-2">{student.gender ?? '-'}</td>
              <td className="p-2">{student.guardianName}</td>
              <td className="flex gap-2 p-2">
                <Link
                  href={`/students/${student._id}/edit`}
                  className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100"
                >
                  Edit
                </Link>
                <Button disabled={deletingId === student._id} onClick={() => onDelete(student)}>
                  {deletingId === student._id ? 'Deleting...' : 'Delete'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

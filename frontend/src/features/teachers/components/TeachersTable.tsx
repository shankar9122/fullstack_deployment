import { Button } from '@/components/ui/Button';
import type { Teacher } from '@/types/teacher';
import Link from 'next/link';

export function TeachersTable({
  teachers,
  deletingId,
  onDelete,
}: {
  teachers: Teacher[];
  deletingId: string | null;
  onDelete: (student: Teacher) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Name</th>
            <th className="p-2">Subject</th>
            <th className="p-2">Email</th>
            <th className="p-2">Phone</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher._id} className="border-b">
              <td className="p-2">{teacher.name}</td>
              <td className="p-2">{teacher.subject}</td>
              <td className="p-2">{teacher.email}</td>
              <td className="p-2">{teacher.phone ?? '-'}</td>
              <td className="flex gap-2 p-2">
                <Link
                  href={`/teachers/${teacher._id}/edit`}
                  className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100"
                >
                  Edit
                </Link>
                <Button disabled={deletingId === teacher._id} onClick={() => onDelete(teacher)}>
                  {deletingId === teacher._id ? 'Deleting...' : 'Delete'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

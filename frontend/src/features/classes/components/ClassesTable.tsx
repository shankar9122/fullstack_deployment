import { Button } from '@/components/ui/Button';
import type { ClassItem } from '@/types/class';
import Link from 'next/link';

export function ClassesTable({
  classes,
  deletingId,
  onDelete,
}: {
  classes: ClassItem[];
  deletingId: string | null;
  onDelete: (student: ClassItem) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Class</th>
            <th className="p-2">Academic year</th>
            <th className="p-2">Class teacher</th>
            <th className="p-2">Subject</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((c) => (
            <tr key={c._id} className="border-b">
              <td className="p-2">
                {c.name}-{c.section}
              </td>
              <td className="p-2">{c.academicYear}</td>
              <td className="p-2">{c.classTeacher?.name ?? <span className="text-gray-500">Not assigned</span>}</td>
              <td className="p-2">{c.classTeacher?.subject ?? '-'}</td>
              <td className="flex gap-2 p-2">
                <Link href={`/classes/${c._id}/edit`} className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100">
                  Edit
                </Link>
                <Button disabled={deletingId === c._id} onClick={() => onDelete(c)}>
                  {deletingId === c._id ? 'Deleting...' : 'Delete'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

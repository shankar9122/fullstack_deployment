import type { ClassItem } from '@/types/class';

export function ClassesTable({ classes }: { classes: ClassItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Class</th>
            <th className="p-2">Academic year</th>
            <th className="p-2">Class teacher</th>
            <th className="p-2">Subject</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

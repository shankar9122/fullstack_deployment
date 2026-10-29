import type { Teacher } from '@/types/teacher';

export function TeachersTable({ teachers }: { teachers: Teacher[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Name</th>
            <th className="p-2">Subject</th>
            <th className="p-2">Email</th>
            <th className="p-2">Phone</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher._id} className="border-b">
              <td className="p-2">{teacher.name}</td>
              <td className="p-2">{teacher.subject}</td>
              <td className="p-2">{teacher.email}</td>
              <td className="p-2">{teacher.phone ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

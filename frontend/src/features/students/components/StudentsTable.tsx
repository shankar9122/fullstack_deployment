import type { Student } from '@/types/student';

export function StudentsTable({ students }: { students: Student[] }) {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

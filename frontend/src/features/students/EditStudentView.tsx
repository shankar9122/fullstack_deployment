'use client';

import { Alert } from '@/components/ui/Alert';
import { Avatar } from '@/components/ui/Avatar';
import { useClassOptions } from '@/features/classes/hooks/useClassOptions';
import { studentService } from '@/services/student.service';
import { useRouter } from 'next/navigation';
import { StudentForm } from './components/StudentForm';
import { useStudent } from './hooks/useStudent';
import { fromStudent, toStudentInput, type StudentFormValues } from './studentForm';

export function EditStudentView({ id }: { id: string }) {
  const router = useRouter();
  const { classes, loading: classesLoading, error: classesError } = useClassOptions();
  const { student, loading: studentLoading, error: studentError } = useStudent(id);

  async function handleSubmit(values: StudentFormValues) {
    await studentService.update(id, toStudentInput(values));
    router.push('/students');
  }

  if (studentLoading || classesLoading) return <p className="text-sm">Loading...</p>;
  if (studentError) return <Alert>{studentError}</Alert>;
  if (classesError) return <Alert>{classesError}</Alert>;
  if (!student) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-4">
        <Avatar name={student.name} src={student.photoUrl} size={72} alt={`Photo of ${student.name}`} />
        <h1 className="text-2xl font-bold">Edit student</h1>
      </div>
      <StudentForm
        initialValues={fromStudent(student)}
        classes={classes}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </section>
  );
}

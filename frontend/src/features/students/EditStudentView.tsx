'use client';

import { Alert } from '@/components/ui/Alert';
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
      <h1 className="mb-4 text-2xl font-bold">Edit student</h1>
      <StudentForm
        initialValues={fromStudent(student)}
        classes={classes}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </section>
  );
}

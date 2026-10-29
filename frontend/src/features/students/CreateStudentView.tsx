'use client';

import { useClassOptions } from '@/features/classes/hooks/useClassOptions';
import { studentService } from '@/services/student.service';
import { useRouter } from 'next/navigation';
import { StudentForm } from './components/StudentForm';
import { emptyStudentForm, toStudentInput, type StudentFormValues } from './studentForm';

export function CreateStudentView() {
  const router = useRouter();
  const { classes } = useClassOptions();

  async function handleSubmit(values: StudentFormValues) {
    await studentService.create(toStudentInput(values));
    router.push('/students');
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Add student</h1>
      <StudentForm
        initialValues={emptyStudentForm}
        classes={classes}
        submitLabel="Create student"
        onSubmit={handleSubmit}
      />
    </section>
  );
}

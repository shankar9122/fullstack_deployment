'use client';

import { teacherService } from '@/services/teacher.service';
import { useRouter } from 'next/navigation';
import { TeacherForm } from './components/TeacherForm';
import { emptyTeacherForm, toTeacherInput, type TeacherFormValues } from './teacherForm';

export function CreateTeacherView() {
  const router = useRouter();

  async function handleSubmit(values: TeacherFormValues) {
    await teacherService.create(toTeacherInput(values));
    router.push('/teachers');
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Add teacher</h1>
      <TeacherForm initialValues={emptyTeacherForm} submitLabel="Create teacher" onSubmit={handleSubmit} />
    </section>
  );
}

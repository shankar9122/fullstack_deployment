'use client';

import { Alert } from '@/components/ui/Alert';
import { teacherService } from '@/services/teacher.service';
import { useRouter } from 'next/navigation';
import { TeacherForm } from './components/TeacherForm';
import { useTeacher } from './hooks/useTeacher';
import { fromTeacher, toTeacherInput, type TeacherFormValues } from './teacherForm';

export function EditTeacherView({ id }: { id: string }) {
  const router = useRouter();
  const { teacher, loading, error } = useTeacher(id);

  async function handleSubmit(values: TeacherFormValues) {
    await teacherService.update(id, toTeacherInput(values));
    router.push('/teachers');
  }

  if (loading) return <p className="text-sm">Loading...</p>;
  if (error) return <Alert>{error}</Alert>;
  if (!teacher) return null;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Edit teacher</h1>
      <TeacherForm initialValues={fromTeacher(teacher)} submitLabel="Save changes" onSubmit={handleSubmit} />
    </section>
  );
}

'use client';

import { Alert } from '@/components/ui/Alert';
import { useTeacherOptions } from '@/features/teachers/hooks/useTeacherOptions';
import { classService } from '@/services/class.service';
import { useRouter } from 'next/navigation';
import { emptyClassForm, toClassInput, type ClassFormValues } from './classForm';
import { ClassForm } from './components/ClassForm';

export function CreateClassView() {
  const router = useRouter();
  const { teachers, error } = useTeacherOptions();

  async function handleSubmit(values: ClassFormValues) {
    await classService.create(toClassInput(values));
    router.push('/classes');
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Add class</h1>
      {error && <Alert>{error}</Alert>}
      <ClassForm
        initialValues={emptyClassForm}
        teachers={teachers}
        submitLabel="Create class"
        onSubmit={handleSubmit}
      />
    </section>
  );
}

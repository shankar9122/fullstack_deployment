'use client';

import { Alert } from '@/components/ui/Alert';
import { useTeacherOptions } from '@/features/teachers/hooks/useTeacherOptions';
import { classService } from '@/services/class.service';
import { useRouter } from 'next/navigation';
import { fromClass, toClassInput, type ClassFormValues } from './classForm';
import { ClassForm } from './components/ClassForm';
import { useClass } from './hooks/useClass';

export function EditClassView({ id }: { id: string }) {
  const router = useRouter();
  const { teachers, loading: teachersLoading, error: teachersError } = useTeacherOptions();
  const { classItem, loading: classLoading, error: classError } = useClass(id);

  async function handleSubmit(values: ClassFormValues) {
    await classService.update(id, toClassInput(values));
    router.push('/classes');
  }

  // Render the form only after the teacher options have loaded. React Hook Form reads
  // defaultValues once, and a <select> will not pick up its value if its options arrive later.
  if (classLoading || teachersLoading) return <p className="text-sm">Loading...</p>;
  if (classError) return <Alert>{classError}</Alert>;
  if (teachersError) return <Alert>{teachersError}</Alert>;
  if (!classItem) return null;

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Edit class</h1>
      <ClassForm
        initialValues={fromClass(classItem)}
        teachers={teachers}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </section>
  );
}

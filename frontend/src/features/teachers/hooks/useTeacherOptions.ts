import { getErrorMessage, isAbortError } from '@/lib/http/errors';
import { teacherService } from '@/services/teacher.service';
import type { Teacher } from '@/types/teacher';
import { useEffect, useState } from 'react';

// Loads teachers for dropdowns (the API caps limit at 100)
export function useTeacherOptions() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    teacherService
      .list({ limit: 100 }, controller.signal)
      .then(({ items }) => {
        setTeachers(items);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(getErrorMessage(err));
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { teachers, loading, error };
}

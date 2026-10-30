import { getErrorMessage, isAbortError } from '@/lib/http/errors';
import { teacherService } from '@/services/teacher.service';
import type { Teacher } from '@/types/teacher';
import { useEffect, useState } from 'react';

export function useTeacher(id: string) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    teacherService
      .getById(id, controller.signal)
      .then((data) => {
        setTeacher(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(getErrorMessage(err));
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { teacher, loading, error };
}

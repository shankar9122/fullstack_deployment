import { getErrorMessage, isAbortError } from '@/lib/http/errors';
import { studentService } from '@/services/student.service';
import type { Student } from '@/types/student';
import { useEffect, useState } from 'react';

export function useStudent(id: string) {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    studentService
      .getById(id, controller.signal)
      .then((data) => {
        setStudent(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(getErrorMessage(err));
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { student, loading, error };
}

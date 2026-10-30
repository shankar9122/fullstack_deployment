import { getErrorMessage, isAbortError } from '@/lib/http/errors';
import { classService } from '@/services/class.service';
import type { ClassItem } from '@/types/class';
import { useEffect, useState } from 'react';

export function useClass(id: string) {
  const [classItem, setClassItem] = useState<ClassItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    classService
      .getById(id, controller.signal)
      .then((data) => {
        setClassItem(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(getErrorMessage(err));
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { classItem, loading, error };
}

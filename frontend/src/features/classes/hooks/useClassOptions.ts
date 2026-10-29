import { getErrorMessage, isAbortError } from '@/lib/http/errors';
import { classService } from '@/services/class.service';
import type { ClassItem } from '@/types/class';
import { useEffect, useState } from 'react';

export function useClassOptions() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    classService
      .list({ limit: 100 }, controller.signal)
      .then(({ items }) => {
        setClasses(items);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(getErrorMessage(err));
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { classes, loading, error };
}

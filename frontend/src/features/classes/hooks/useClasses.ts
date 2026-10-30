import { getErrorMessage, isAbortError } from '@/lib/http/errors';
import { classService } from '@/services/class.service';
import type { Pagination } from '@/types/api';
import type { ClassItem, ClassListQuery } from '@/types/class';
import { useCallback, useEffect, useState } from 'react';

interface State {
  classes: ClassItem[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

export function useClasses(query: ClassListQuery) {
  const [state, setState] = useState<State>({
    classes: [],
    pagination: null,
    loading: true,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  const { name, academicYear, page, limit } = query;

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    classService
      .list({ name, academicYear, page, limit }, controller.signal)
      .then(({ items, pagination }) => setState({ classes: items, pagination, loading: false, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(error) }));
      });

    return () => controller.abort();
  }, [name, academicYear, page, limit, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, refresh };
}

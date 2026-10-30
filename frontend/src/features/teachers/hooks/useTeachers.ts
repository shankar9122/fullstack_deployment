import { getErrorMessage, isAbortError } from '@/lib/http/errors';
import { teacherService } from '@/services/teacher.service';
import type { Pagination } from '@/types/api';
import type { Teacher, TeacherListQuery } from '@/types/teacher';
import { useCallback, useEffect, useState } from 'react';

interface State {
  teachers: Teacher[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

export function useTeachers(query: TeacherListQuery) {
  const [state, setState] = useState<State>({
    teachers: [],
    pagination: null,
    loading: true,
    error: null,
  });

  const { search, page, limit } = query;
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    teacherService
      .list({ search, page, limit }, controller.signal)
      .then(({ items, pagination }) => setState({ teachers: items, pagination, loading: false, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(error) }));
      });

    return () => controller.abort();
  }, [search, page, limit, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, refresh };
}

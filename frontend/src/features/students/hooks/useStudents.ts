import { getErrorMessage, isAbortError } from '@/lib/http/errors';
import { studentService } from '@/services/student.service';
import type { Pagination } from '@/types/api';
import type { Student, StudentListQuery } from '@/types/student';
import { useCallback, useEffect, useState } from 'react';

interface State {
  students: Student[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

export function useStudents(query: StudentListQuery) {
  const [state, setState] = useState<State>({
    students: [],
    pagination: null,
    loading: true,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  const { search, class: classId, gender, sortBy, order, page, limit } = query;

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    studentService
      .list({ search, class: classId, gender, sortBy, order, page, limit }, controller.signal)
      .then(({ items, pagination }) => setState({ students: items, pagination, loading: false, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(error) }));
      });

    return () => controller.abort();
  }, [search, classId, gender, sortBy, order, page, limit, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, refresh };
}

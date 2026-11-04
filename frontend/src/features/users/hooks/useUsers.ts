import { getErrorMessage, isAbortError } from '@/lib/http/errors';
import { userService } from '@/services/user.service';
import type { Pagination } from '@/types/api';
import type { User, UserListQuery } from '@/types/user';
import { useCallback, useEffect, useState } from 'react';

interface State {
  users: User[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
}

export function useUsers(query: UserListQuery) {
  const [state, setState] = useState<State>({
    users: [],
    pagination: null,
    loading: true,
    error: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  const { search, role, isActive, page, limit } = query;

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: null }));

    userService
      .list({ search, role, isActive, page, limit }, controller.signal)
      .then(({ items, pagination }) => setState({ users: items, pagination, loading: false, error: null }))
      .catch((error: unknown) => {
        if (isAbortError(error)) return;
        setState((prev) => ({ ...prev, loading: false, error: getErrorMessage(error) }));
      });

    return () => controller.abort();
  }, [search, role, isActive, page, limit, reloadKey]);

  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  return { ...state, refresh };
}

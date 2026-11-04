import { getErrorMessage, isAbortError } from '@/lib/http/errors';
import { userService } from '@/services/user.service';
import type { User } from '@/types/user';
import { useEffect, useState } from 'react';

export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    userService
      .getById(id, controller.signal)
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setError(getErrorMessage(err));
        setLoading(false);
      });

    return () => controller.abort();
  }, [id]);

  return { user, loading, error };
}

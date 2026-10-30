import { ApiError, getErrorMessage } from '@/lib/http/errors';
import { useState } from 'react';

export interface ServerError {
  message: string;
  details?: string[];
}

export function useFormSubmit<T>(onSubmit: (values: T) => Promise<void>) {
  const [serverError, setServerError] = useState<ServerError | null>(null);
  const [done, setDone] = useState(false);

  async function run(values: T) {
    setServerError(null);

    try {
      await onSubmit(values);
      // Keep the submit button disabled while the redirect happens, to avoid double submits
      setDone(true);
    } catch (error) {
      setServerError({
        message: getErrorMessage(error),
        details: error instanceof ApiError ? error.details : undefined,
      });
    }
  }

  return { run, serverError, done };
}

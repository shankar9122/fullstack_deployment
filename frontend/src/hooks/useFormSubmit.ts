import { ApiError, getErrorMessage } from '@/lib/http/errors';
import { useState } from 'react';

export interface ServerError {
  message: string;
  details?: string[];
}

interface Options {
  /**
   * Keep the submit button disabled after a successful submit. Right for forms that redirect
   * (it prevents double submits). Turn it off for forms that stay on the page
   */
  disableAfterSuccess?: boolean;
}

export function useFormSubmit<T>(onSubmit: (values: T) => Promise<void>, { disableAfterSuccess = true }: Options = {}) {
  const [serverError, setServerError] = useState<ServerError | null>(null);
  const [done, setDone] = useState(false);

  async function run(values: T) {
    setServerError(null);

    try {
      await onSubmit(values);
      setDone(disableAfterSuccess);
    } catch (error) {
      setServerError({
        message: getErrorMessage(error),
        details: error instanceof ApiError ? error.details : undefined,
      });
    }
  }

  return { run, serverError, done };
}

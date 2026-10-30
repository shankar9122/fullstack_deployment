import { Alert } from '@/components/ui/Alert';
import type { ServerError } from '@/hooks/useFormSubmit';

export function ServerErrorAlert({ error }: { error: ServerError | null }) {
  if (!error) return null;

  return (
    <Alert>
      <p>{error.message}</p>
      {error.details && (
        <ul className="mt-1 list-disc pl-5">
          {error.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </Alert>
  );
}

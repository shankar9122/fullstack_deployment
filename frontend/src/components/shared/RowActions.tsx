import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';

interface RowActionsProps {
  editHref: string;
  onDelete: () => void;
  /** Name of the record, used in accessible labels like "Edit Riya Nair" */
  label: string;
  deleting?: boolean;
}

export function RowActions({ editHref, onDelete, label, deleting = false }: RowActionsProps) {
  return (
    <div className="flex gap-2">
      <LinkButton href={editHref} aria-label={`Edit ${label}`}>
        Edit
      </LinkButton>
      <Button onClick={onDelete} disabled={deleting} aria-label={`Delete ${label}`}>
        {deleting ? 'Deleting...' : 'Delete'}
      </Button>
    </div>
  );
}

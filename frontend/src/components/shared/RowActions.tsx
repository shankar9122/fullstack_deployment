import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';

interface RowActionsProps {
  editHref: string;
  onDelete?: () => void;
  /** Name of the record, used in accessible labels like "Edit Riya Nair" */
  label: string;
  deleting?: boolean;
  /** Disables delete, for example on the signed-in user's own row */
  disableDelete?: boolean;
  /** Tooltip shown on the disabled delete button */
  deleteHint?: string;
}

export function RowActions({
  editHref,
  onDelete,
  label,
  deleting = false,
  disableDelete = false,
  deleteHint,
}: RowActionsProps) {
  return (
    <div className="flex gap-2">
      <LinkButton href={editHref} aria-label={`Edit ${label}`}>
        Edit
      </LinkButton>
      {onDelete && (
        <Button
          onClick={onDelete}
          disabled={deleting || disableDelete}
          title={disableDelete ? deleteHint : undefined}
          aria-label={`Delete ${label}`}
        >
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      )}
    </div>
  );
}

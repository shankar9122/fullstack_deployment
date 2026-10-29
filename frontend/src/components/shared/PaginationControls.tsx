import { Button } from '@/components/ui/Button';
import type { Pagination } from '@/types/api';

interface PaginationControlsProps {
  pagination: Pagination;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ pagination, itemLabel = 'items', onPageChange }: PaginationControlsProps) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center gap-3">
      <Button disabled={!pagination.hasPreviousPage} onClick={() => onPageChange(pagination.page - 1)}>
        Previous
      </Button>
      <span className="text-sm">
        Page {pagination.page} of {pagination.totalPages} ({pagination.total} {itemLabel})
      </span>
      <Button disabled={!pagination.hasNextPage} onClick={() => onPageChange(pagination.page + 1)}>
        Next
      </Button>
    </div>
  );
}

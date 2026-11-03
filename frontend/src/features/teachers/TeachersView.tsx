'use client';

import { AdminOnly } from '@/components/shared/AdminOnly';
import { DataTable } from '@/components/shared/DataTable';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { RowActions } from '@/components/shared/RowActions';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { LinkButton } from '@/components/ui/LinkButton';
import { useDebounce } from '@/hooks/useDebounce';
import { getErrorMessage } from '@/lib/http/errors';
import { useAuth } from '@/providers/auth-context';
import { teacherService } from '@/services/teacher.service';
import { Teacher } from '@/types/teacher';
import { useState } from 'react';
import { useTeachers } from './hooks/useTeachers';
import { teacherColumns } from './teacherColumns';

const PAGE_SIZE = 10;

export function TeachersView() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  const { teachers, pagination, loading, error, refresh } = useTeachers({
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });

  async function handleDelete(teacher: Teacher) {
    if (!window.confirm(`Delete ${teacher.name}? This cannot be undone.`)) return;

    setDeletingId(teacher._id);
    setDeleteError(null);

    try {
      await teacherService.remove(teacher._id);

      // Aakhri row delete hui toh khaali page na dikhe, peeche wale page par jao
      if (teachers.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        refresh();
      }
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <AdminOnly>
          <LinkButton href="/teachers/new">Add Teacher</LinkButton>
        </AdminOnly>
      </div>

      <div className="mb-4">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or subject"
          aria-label="Search teachers"
        />
      </div>

      {error && <Alert>{error}</Alert>}
      {deleteError && <Alert>{deleteError}</Alert>}
      {loading && <p className="text-sm">Loading...</p>}
      {!loading && !error && teachers.length === 0 && <p className="text-sm">No teachers found.</p>}

      <DataTable
        caption="Teachers"
        columns={teacherColumns}
        rows={teachers}
        getRowKey={(teacher) => teacher._id}
        renderActions={
          isAdmin
            ? (teacher) => (
                <RowActions
                  label={teacher.name}
                  editHref={`/teachers/${teacher._id}/edit`}
                  deleting={deletingId === teacher._id}
                  onDelete={() => handleDelete(teacher)}
                />
              )
            : undefined
        }
      />

      {pagination && <PaginationControls pagination={pagination} itemLabel="teachers" onPageChange={setPage} />}
    </section>
  );
}

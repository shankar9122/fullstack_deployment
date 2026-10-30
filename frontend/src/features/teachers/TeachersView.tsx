'use client';

import { PaginationControls } from '@/components/shared/PaginationControls';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';
import { getErrorMessage } from '@/lib/http/errors';
import { teacherService } from '@/services/teacher.service';
import { Teacher } from '@/types/teacher';
import Link from 'next/link';
import { useState } from 'react';
import { TeachersTable } from './components/TeachersTable';
import { useTeachers } from './hooks/useTeachers';

const PAGE_SIZE = 10;

export function TeachersView() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
        <Link href="/teachers/new" className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100">
          Add Teacher
        </Link>
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
      {loading && <p className="text-sm">Loading...</p>}
      {!loading && !error && teachers.length === 0 && <p className="text-sm">No teachers found.</p>}

      {teachers.length > 0 && <TeachersTable teachers={teachers} deletingId={deletingId} onDelete={handleDelete} />}

      {pagination && <PaginationControls pagination={pagination} itemLabel="teachers" onPageChange={setPage} />}
    </section>
  );
}

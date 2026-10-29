'use client';

import { PaginationControls } from '@/components/shared/PaginationControls';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { useDebounce } from '@/hooks/useDebounce';
import { useState } from 'react';
import { TeachersTable } from './components/TeachersTable';
import { useTeachers } from './hooks/useTeachers';

const PAGE_SIZE = 10;

export function TeachersView() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  const { teachers, pagination, loading, error } = useTeachers({
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Teachers</h1>

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

      {teachers.length > 0 && <TeachersTable teachers={teachers} />}

      {pagination && <PaginationControls pagination={pagination} itemLabel="teachers" onPageChange={setPage} />}
    </section>
  );
}

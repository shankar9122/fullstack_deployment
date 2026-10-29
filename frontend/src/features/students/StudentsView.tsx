'use client';

import { PaginationControls } from '@/components/shared/PaginationControls';
import { Alert } from '@/components/ui/Alert';
import { useClassOptions } from '@/features/classes/hooks/useClassOptions';
import { useDebounce } from '@/hooks/useDebounce';
import { useState } from 'react';
import { StudentFilters } from './components/StudentFilters';
import { StudentsTable } from './components/StudentsTable';
import { useStudents } from './hooks/useStudents';

const PAGE_SIZE = 10;

export function StudentsView() {
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);
  const { classes } = useClassOptions();
  const { students, pagination, loading, error } = useStudents({
    search: debouncedSearch,
    class: classId,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Students</h1>

      <StudentFilters
        search={search}
        classId={classId}
        classes={classes}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onClassChange={(value) => {
          setClassId(value);
          setPage(1);
        }}
      />

      {error && <Alert>{error}</Alert>}
      {loading && <p className="text-sm">Loading...</p>}
      {!loading && !error && students.length === 0 && <p className="text-sm">No students found.</p>}

      {students.length > 0 && <StudentsTable students={students} />}

      {pagination && <PaginationControls pagination={pagination} itemLabel="students" onPageChange={setPage} />}
    </section>
  );
}

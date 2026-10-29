'use client';

import { PaginationControls } from '@/components/shared/PaginationControls';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useDebounce } from '@/hooks/useDebounce';
import { useState } from 'react';
import { ClassesTable } from './components/ClassesTable';
import { useClasses } from './hooks/useClasses';

const PAGE_SIZE = 10;
const CLASS_NAMES = Array.from({ length: 12 }, (_, index) => String(index + 1));
const YEAR_PATTERN = /^\d{4}-\d{2}$/;

export function ClassesView() {
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);

  const debouncedYear = useDebounce(year.trim());

  // Backend adhoore format (jaise "2025") par 400 deta hai,
  // isliye filter tabhi bhejo jab poora "2025-26" jaisa ban jaye
  const academicYear = YEAR_PATTERN.test(debouncedYear) ? debouncedYear : undefined;

  const { classes, pagination, loading, error } = useClasses({
    name: name || undefined,
    academicYear,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Classes</h1>

      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All classes</option>
          {CLASS_NAMES.map((n) => (
            <option key={n} value={n}>
              Class {n}
            </option>
          ))}
        </Select>

        <Input
          value={year}
          onChange={(e) => {
            setYear(e.target.value);
            setPage(1);
          }}
          placeholder="Academic year (2025-26)"
          aria-label="Academic year"
        />
      </div>

      {error && <Alert>{error}</Alert>}
      {loading && <p className="text-sm">Loading...</p>}
      {!loading && !error && classes.length === 0 && <p className="text-sm">No classes found.</p>}

      {classes.length > 0 && <ClassesTable classes={classes} />}

      {pagination && <PaginationControls pagination={pagination} itemLabel="classes" onPageChange={setPage} />}
    </section>
  );
}

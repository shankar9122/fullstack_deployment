'use client';

import { PaginationControls } from '@/components/shared/PaginationControls';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useDebounce } from '@/hooks/useDebounce';
import { getErrorMessage } from '@/lib/http/errors';
import { classService } from '@/services/class.service';
import { ClassItem } from '@/types/class';
import Link from 'next/link';
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

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const debouncedYear = useDebounce(year.trim());

  // Backend adhoore format (jaise "2025") par 400 deta hai,
  // isliye filter tabhi bhejo jab poora "2025-26" jaisa ban jaye
  const academicYear = YEAR_PATTERN.test(debouncedYear) ? debouncedYear : undefined;

  const { classes, pagination, loading, error, refresh } = useClasses({
    name: name || undefined,
    academicYear,
    page,
    limit: PAGE_SIZE,
  });

  async function handleDelete(classItem: ClassItem) {
    if (!window.confirm(`Delete ${classItem.name}? This cannot be undone.`)) return;

    setDeletingId(classItem._id);
    setDeleteError(null);

    try {
      await classService.remove(classItem._id);

      // Aakhri row delete hui toh khaali page na dikhe, peeche wale page par jao
      if (classes.length === 1 && page > 1) {
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
        <h1 className="text-2xl font-bold">Classes</h1>
        <Link href="/classes/new" className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100">
          Add Class
        </Link>
      </div>

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
      {deleteError && <Alert>{deleteError}</Alert>}
      {loading && <p className="text-sm">Loading...</p>}
      {!loading && !error && classes.length === 0 && <p className="text-sm">No classes found.</p>}

      {classes.length > 0 && <ClassesTable classes={classes} deletingId={deletingId} onDelete={handleDelete} />}

      {pagination && <PaginationControls pagination={pagination} itemLabel="classes" onPageChange={setPage} />}
    </section>
  );
}

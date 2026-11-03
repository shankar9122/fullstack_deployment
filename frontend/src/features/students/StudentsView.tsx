'use client';

import { AdminOnly } from '@/components/shared/AdminOnly';
import { DataTable } from '@/components/shared/DataTable';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { RowActions } from '@/components/shared/RowActions';
import { Alert } from '@/components/ui/Alert';
import { LinkButton } from '@/components/ui/LinkButton';
import { useClassOptions } from '@/features/classes/hooks/useClassOptions';
import { useDebounce } from '@/hooks/useDebounce';
import { getErrorMessage } from '@/lib/http/errors';
import { useAuth } from '@/providers/auth-context';
import { studentService } from '@/services/student.service';
import { Student } from '@/types/student';
import { useState } from 'react';
import { StudentFilters } from './components/StudentFilters';
import { useStudents } from './hooks/useStudents';
import { studentColumns } from './studentColumns';

const PAGE_SIZE = 10;

export function StudentsView() {
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [page, setPage] = useState(1);
  const { isAdmin } = useAuth();

  const debouncedSearch = useDebounce(search);
  const { classes } = useClassOptions();
  const { students, pagination, loading, error, refresh } = useStudents({
    search: debouncedSearch,
    class: classId,
    page,
    limit: PAGE_SIZE,
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete(student: Student) {
    if (!window.confirm(`Delete ${student.name}? This cannot be undone.`)) return;

    setDeletingId(student._id);
    setDeleteError(null);

    try {
      await studentService.remove(student._id);

      // Aakhri row delete hui toh khaali page na dikhe, peeche wale page par jao
      if (students.length === 1 && page > 1) {
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
        <h1 className="text-2xl font-bold">Students</h1>
        <AdminOnly>
          <LinkButton href="/students/new">Add student</LinkButton>
        </AdminOnly>
      </div>

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
      {deleteError && <Alert>{deleteError}</Alert>}

      {students.length > 0 && (
        <DataTable
          caption="Students"
          columns={studentColumns}
          rows={students}
          getRowKey={(student) => student._id}
          renderActions={
            isAdmin
              ? (student) => (
                  <RowActions
                    label={student.name}
                    editHref={`/students/${student._id}/edit`}
                    deleting={deletingId === student._id}
                    onDelete={() => handleDelete(student)}
                  />
                )
              : undefined
          }
        />
      )}
      {pagination && <PaginationControls pagination={pagination} itemLabel="students" onPageChange={setPage} />}
    </section>
  );
}

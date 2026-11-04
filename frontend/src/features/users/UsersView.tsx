'use client';

import { DataTable } from '@/components/shared/DataTable';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { RowActions } from '@/components/shared/RowActions';
import { Alert } from '@/components/ui/Alert';
import { Input } from '@/components/ui/Input';
import { LinkButton } from '@/components/ui/LinkButton';
import { Select } from '@/components/ui/Select';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/providers/auth-context';
import type { Role } from '@/types/auth';
import { useMemo, useState } from 'react';
import { useUsers } from './hooks/useUsers';
import { createUserColumns } from './userColumns';

const PAGE_SIZE = 10;

type StatusFilter = '' | 'active' | 'disabled';

export function UsersView() {
  const { user: currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'' | Role>('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search);

  const { users, pagination, loading, error } = useUsers({
    search: debouncedSearch,
    role: role || undefined,
    isActive: status === '' ? undefined : status === 'active',
    page,
    limit: PAGE_SIZE,
  });

  const columns = useMemo(() => createUserColumns(currentUser?._id), [currentUser?._id]);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <LinkButton href="/users/new">Add user</LinkButton>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email"
          aria-label="Search users"
        />

        <Select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as '' | Role);
            setPage(1);
          }}
          aria-label="Filter by role"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
        </Select>

        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as StatusFilter);
            setPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </Select>
      </div>

      {error && <Alert>{error}</Alert>}
      {loading && <p className="text-sm">Loading...</p>}
      {!loading && !error && users.length === 0 && <p className="text-sm">No users found.</p>}

      {users.length > 0 && (
        <DataTable
          caption="Users"
          columns={columns}
          rows={users}
          getRowKey={(user) => user._id}
          renderActions={(user) => <RowActions label={user.name} editHref={`/users/${user._id}/edit`} />}
        />
      )}

      {pagination && <PaginationControls pagination={pagination} itemLabel="users" onPageChange={setPage} />}
    </section>
  );
}

import type { Column } from '@/components/shared/DataTable';
import type { User } from '@/types/user';

// A function (not a constant) because the "(you)" marker depends on who is signed in
export function createUserColumns(currentUserId: string | undefined): Column<User>[] {
  return [
    {
      key: 'name',
      header: 'Name',
      cell: (user) => (
        <>
          {user.name}
          {user._id === currentUserId && <span className="ml-2 text-xs text-gray-500">(you)</span>}
        </>
      ),
    },
    { key: 'email', header: 'Email', cell: (user) => user.email },
    {
      key: 'role',
      header: 'Role',
      cell: (user) => <span className="rounded bg-gray-100 px-2 py-0.5 text-xs capitalize">{user.role}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user) =>
        user.isActive ? (
          <span className="text-green-700">Active</span>
        ) : (
          <span className="text-gray-500">Disabled</span>
        ),
    },
  ];
}

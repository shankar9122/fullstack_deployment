import { http } from '@/lib/http/client';
import type { Paginated, Pagination } from '@/types/api';
import type { CreateUserInput, UpdateUserInput, User, UserListQuery } from '@/types/user';

interface UserListResponse {
  users: User[];
  pagination: Pagination;
}

export const userService = {
  async list(query: UserListQuery = {}, signal?: AbortSignal): Promise<Paginated<User>> {
    // Booleans become "true" / "false", which is what the API expects for isActive
    const { users, pagination } = await http.get<UserListResponse>('/users', {
      params: { ...query },
      signal,
    });
    return { items: users, pagination };
  },

  async getById(id: string, signal?: AbortSignal): Promise<User> {
    const { user } = await http.get<{ user: User }>(`/users/${id}`, { signal });
    return user;
  },

  async create(input: CreateUserInput): Promise<User> {
    const { user } = await http.post<{ user: User }>('/users', { body: input });
    return user;
  },

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const { user } = await http.patch<{ user: User }>(`/users/${id}`, { body: input });
    return user;
  },
};

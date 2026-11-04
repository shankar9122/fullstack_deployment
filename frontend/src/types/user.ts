import type { AuthUser, Role } from './auth';

// The same shape the login endpoint returns
export type User = AuthUser;

export interface UserListQuery {
  search?: string;
  role?: Role;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: Role;
  isActive?: boolean;
  password?: string; // only sent when an admin resets someone else's password
}

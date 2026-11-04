import type { CreateUserInput, UpdateUserInput, User } from '@/types/user';
import { z } from 'zod';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72; // bcrypt ignores everything after 72 bytes

// Bytes, not characters: "é" or an emoji takes more than one byte
const byteLength = (value: string) => new TextEncoder().encode(value).length;

const name = z
  .string()
  .trim()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name cannot exceed 100 characters');

const email = z.string().trim().min(1, 'Email is required').regex(EMAIL_PATTERN, 'Invalid email address');

const role = z.enum(['admin', 'teacher']);
const status = z.enum(['active', 'disabled']);

// Both schemas share one shape so the form has a single TypeScript type
function buildSchema(password: z.ZodString) {
  return z.object({ name, email, role, status, password });
}

// Create: the password is required
export const createUserSchema = buildSchema(
  z
    .string()
    .min(MIN_PASSWORD_LENGTH, 'Password must be at least 8 characters')
    .refine((value) => byteLength(value) <= MAX_PASSWORD_BYTES, 'Password is too long (72 bytes maximum)'),
);

// Edit: an empty password means "keep the current one"
export const editUserSchema = buildSchema(
  z
    .string()
    .refine((value) => value === '' || value.length >= MIN_PASSWORD_LENGTH, 'Password must be at least 8 characters')
    .refine(
      (value) => value === '' || byteLength(value) <= MAX_PASSWORD_BYTES,
      'Password is too long (72 bytes maximum)',
    ),
);

export type UserFormValues = z.infer<typeof createUserSchema>;

export const emptyUserForm: UserFormValues = {
  name: '',
  email: '',
  password: '',
  role: 'teacher',
  status: 'active',
};

export function fromUser(user: User): UserFormValues {
  return {
    name: user.name,
    email: user.email,
    password: '', // never prefilled
    role: user.role,
    status: user.isActive ? 'active' : 'disabled',
  };
}

// New accounts are always active (the API does not accept isActive on create)
export function toCreateUserInput(values: UserFormValues): CreateUserInput {
  return {
    name: values.name,
    email: values.email,
    password: values.password,
    role: values.role,
  };
}

// Send only the fields that actually changed, so unrelated rules never get triggered
export function toUpdateUserInput(values: UserFormValues, original: User, isSelf: boolean): UpdateUserInput {
  const input: UpdateUserInput = {};

  if (values.name !== original.name) input.name = values.name;
  if (values.email.toLowerCase() !== original.email) input.email = values.email;

  // Role, status and password of your own account are not editable here
  // (the API rejects it, and the form hides those fields)
  if (!isSelf) {
    if (values.role !== original.role) input.role = values.role;

    const isActive = values.status === 'active';
    if (isActive !== original.isActive) input.isActive = isActive;

    if (values.password !== '') input.password = values.password;
  }

  return input;
}

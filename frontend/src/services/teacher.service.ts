import { http } from '@/lib/http/client';
import type { Paginated, Pagination } from '@/types/api';
import type { Teacher, TeacherInput, TeacherListQuery } from '@/types/teacher';

interface TeacherListResponse {
  teachers: Teacher[];
  pagination: Pagination;
}

export const teacherService = {
  async list(query: TeacherListQuery = {}, signal?: AbortSignal): Promise<Paginated<Teacher>> {
    const { teachers, pagination } = await http.get<TeacherListResponse>('/teachers', {
      params: { ...query },
      signal,
    });
    return { items: teachers, pagination };
  },

  async getById(id: string, signal?: AbortSignal): Promise<Teacher> {
    const { teacher } = await http.get<{ teacher: Teacher }>(`/teachers/${id}`, { signal });
    return teacher;
  },

  async create(input: TeacherInput): Promise<Teacher> {
    // On create, omit an empty phone instead of storing null
    const body = { ...input, phone: input.phone ?? undefined };
    const { teacher } = await http.post<{ teacher: Teacher }>('/teachers', { body });
    return teacher;
  },

  async update(id: string, input: TeacherInput): Promise<Teacher> {
    // On update, null is sent as-is so the backend clears the phone
    const { teacher } = await http.patch<{ teacher: Teacher }>(`/teachers/${id}`, { body: input });
    return teacher;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/teachers/${id}`);
  },
};

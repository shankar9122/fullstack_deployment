import { http } from '@/lib/http/client';
import type { Paginated, Pagination } from '@/types/api';
import type { Teacher, TeacherListQuery } from '@/types/teacher';

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
};

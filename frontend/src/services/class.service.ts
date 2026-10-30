import { http } from '@/lib/http/client';
import type { Paginated, Pagination } from '@/types/api';
import type { ClassInput, ClassItem, ClassListQuery } from '@/types/class';

interface ClassListResponse {
  classes: ClassItem[];
  pagination: Pagination;
}

export const classService = {
  async list(query: ClassListQuery = {}, signal?: AbortSignal): Promise<Paginated<ClassItem>> {
    const { classes, pagination } = await http.get<ClassListResponse>('/classes', {
      params: { ...query },
      signal,
    });
    return { items: classes, pagination };
  },

  async getById(id: string, signal?: AbortSignal): Promise<ClassItem> {
    // The backend response key is "class", which is a reserved word, so rename it
    const { class: classItem } = await http.get<{ class: ClassItem }>(`/classes/${id}`, { signal });
    return classItem;
  },

  async create(input: ClassInput): Promise<ClassItem> {
    // On create, omit the class teacher when none is selected
    const body = { ...input, classTeacher: input.classTeacher ?? undefined };
    const { class: classItem } = await http.post<{ class: ClassItem }>('/classes', { body });
    return classItem;
  },

  async update(id: string, input: ClassInput): Promise<ClassItem> {
    // On update, null is sent as-is so the backend removes the class teacher
    const { class: classItem } = await http.patch<{ class: ClassItem }>(`/classes/${id}`, {
      body: input,
    });
    return classItem;
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/classes/${id}`);
  },
};

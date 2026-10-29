import { http } from '@/lib/http/client';
import type { Paginated, Pagination } from '@/types/api';
import type { ClassItem, ClassListQuery } from '@/types/class';

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
};

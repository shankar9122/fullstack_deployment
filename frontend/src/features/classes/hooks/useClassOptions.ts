import { classService } from '@/services/class.service';
import type { ClassItem } from '@/types/class';
import { useEffect, useState } from 'react';

export function useClassOptions() {
  const [classes, setClasses] = useState<ClassItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    classService
      .list({ limit: 100 }, controller.signal)
      .then(({ items }) => setClasses(items))
      .catch(() => {}); // dropdown na bhi bane toh page chalta rahe

    return () => controller.abort();
  }, []);

  return { classes };
}

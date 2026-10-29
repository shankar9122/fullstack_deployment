import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { ClassItem } from '@/types/class';

interface StudentFiltersProps {
  search: string;
  classId: string;
  classes: ClassItem[];
  onSearchChange: (value: string) => void;
  onClassChange: (value: string) => void;
}

export function StudentFilters({ search, classId, classes, onSearchChange, onClassChange }: StudentFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search by name or email" />
      <Select value={classId} onChange={(e) => onClassChange(e.target.value)}>
        <option value="">All classes</option>
        {classes.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}-{c.section} ({c.academicYear})
          </option>
        ))}
      </Select>
    </div>
  );
}

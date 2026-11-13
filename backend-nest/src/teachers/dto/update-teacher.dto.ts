import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDto } from './create-teacher.dto';

// Same fields and the same rules, but every field becomes optional (PATCH sends only what changed)
export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {}
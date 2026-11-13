import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { trim } from '../../common/transforms/string.transforms';

// Inherits page and limit (and their rules) from PaginationQueryDto
export class ListTeachersQueryDto extends PaginationQueryDto {
  // "?search=a&search=b" arrives as an array, and @IsString rejects it
  @Transform(trim)
  @IsOptional()
  @IsString({ message: 'Invalid search parameter' })
  search?: string;
}
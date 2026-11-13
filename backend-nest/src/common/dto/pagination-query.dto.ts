import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

const INVALID = 'Invalid pagination parameters';

// Query values arrive as strings, so @Type(() => Number) converts them first.
// "abc" becomes NaN and "" becomes 0, and both fail the checks below.
// Decorators run bottom to top, so the type check (@IsInt) comes first
export class PaginationQueryDto {
  @IsOptional()
  @Max(Number.MAX_SAFE_INTEGER, { message: INVALID })
  @Min(1, { message: INVALID })
  @IsInt({ message: INVALID })
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Max(Number.MAX_SAFE_INTEGER, { message: INVALID })
  @Min(1, { message: INVALID })
  @IsInt({ message: INVALID })
  @Type(() => Number)
  limit?: number;
}
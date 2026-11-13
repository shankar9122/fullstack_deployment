import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { EMAIL_PATTERN, PHONE_PATTERN } from '../../common/constants/patterns';
import { trim, trimAndLowercase, trimOrNull } from '../../common/transforms/string.transforms';

export class CreateTeacherDto {
  @Transform(trim)
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be text' })
  name!: string;

  @Transform(trimAndLowercase)
  @Matches(EMAIL_PATTERN, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsString({ message: 'Email must be text' })
  email!: string;

  // Optional. null (or an empty value) means "no phone", and it is the way to clear it on update
  @Transform(trimOrNull)
  @IsOptional()
  @Matches(PHONE_PATTERN, { message: 'Phone must be a valid 10-digit Indian number' })
  @IsString({ message: 'Phone must be text' })
  phone?: string | null;

  @Transform(trim)
  @IsNotEmpty({ message: 'Subject is required' })
  @IsString({ message: 'Subject must be text' })
  subject!: string;
}
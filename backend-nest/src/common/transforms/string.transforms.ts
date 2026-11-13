import type { TransformFnParams } from 'class-transformer';

// These run BEFORE validation (the ValidationPipe has transform: true). They only touch strings,
// so a wrong type (an object, an array) still reaches @IsString() and gets rejected there

export const trim = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export const trimAndLowercase = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

// An empty optional input means "no value", so it becomes null
export const trimOrNull = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() || null : value;
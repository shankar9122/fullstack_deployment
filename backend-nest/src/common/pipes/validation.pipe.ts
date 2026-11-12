import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

// Turns class-validator's nested error objects into a flat list of messages
function flatten(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...flatten(error.children ?? []),
  ]);
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    // Drops every property that has no validation decorator. This is the Nest version of the
    // Express "pickAllowed" whitelist, and it stops clients from setting fields like "role" or "_id"
    whitelist: true,

    // Turns the plain JSON body into an instance of the DTO class (and converts types where asked)
    transform: true,

    // One message per field, like the Express API
    stopAtFirstError: true,

    // Same response shape as the Express API: { message, errors }
    exceptionFactory: (errors) =>
      new BadRequestException({ message: 'Validation failed', errors: flatten(errors) }),
  });
}
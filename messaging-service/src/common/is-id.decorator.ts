import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNotEmpty, Matches, ValidationOptions } from 'class-validator';

/**
 * Matches the IDs that actually flow through the system:
 *  - numeric IDs issued by the relational services (e.g. "13", "18", "19")
 *  - legacy UUIDs, kept for backward compatibility with older callers
 */
const ID_PATTERN =
  /^(\d+|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;

/**
 * Validates an entity identifier, accepting either a numeric ID (sent as a
 * string or a JSON number) or a UUID. Numbers are coerced to strings so the
 * decorated property stays a `string` downstream.
 *
 * Drop-in replacement for `@IsUUID()` on ID fields.
 */
export function IsId(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    Transform(({ value }) =>
      typeof value === 'number' ? String(value) : value,
    ),
    IsNotEmpty(validationOptions),
    Matches(ID_PATTERN, {
      message: '$property must be a numeric ID or a UUID',
      ...validationOptions,
    }),
  );
}

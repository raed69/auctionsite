import { BadRequestException } from '@nestjs/common';
import { supabase } from './supabase.client';

/**
 * Thin wrapper around `supabase.rpc()` for Postgres stored procedures.
 *
 * Used for atomic, race-condition-safe operations (e.g. balance increments)
 * that must run server-side in the database. Normalises Supabase's
 * `{ data, error }` result into a value-or-throw contract so callers don't
 * repeat the same error-unwrapping boilerplate.
 *
 * @param fn - the Postgres function name to invoke
 * @param params - named arguments passed to the function
 * @param errorPrefix - optional prefix prepended to the thrown error message
 * @returns the data returned by the RPC call
 * @throws BadRequestException if the RPC call returns an error
 */
export async function callRpc<T = unknown>(
  fn: string,
  params: Record<string, unknown>,
  errorPrefix?: string,
): Promise<T> {
  const { data, error } = await supabase.rpc(fn, params);

  if (error) {
    throw new BadRequestException(
      errorPrefix ? `${errorPrefix}: ${error.message}` : error.message,
    );
  }

  return data as T;
}

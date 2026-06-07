import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Returns a lazily-initialised Supabase client, or `null` if Supabase is not
 * configured. Initialisation is deferred so that `@nestjs/config` has loaded
 * the environment before the client is created.
 *
 * @returns the shared Supabase client, or null when env vars are absent
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  client = createClient(url, key);
  return client;
}

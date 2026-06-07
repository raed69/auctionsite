import { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'auction-images';
// Signed URLs are minted fresh on every read, so a short-ish lifetime is fine
// and still allows the browser to cache the image for the page session.
const DEFAULT_EXPIRES_IN = 60 * 60; // 1 hour

/**
 * Normalises a stored image reference to its in-bucket object path.
 *
 * Historically we stored full `.../object/public/auction-images/<path>` URLs
 * (which only resolve on a public bucket). The bucket is private, so we sign on
 * read instead — this strips any host/prefix and query string, leaving just the
 * object path. Already-bare paths pass through unchanged.
 */
function toObjectPath(stored: string): string {
  const marker = `/${BUCKET}/`;
  const i = stored.indexOf(marker);
  const withoutHost = i !== -1 ? stored.slice(i + marker.length) : stored;
  return withoutHost.replace(/^\/+/, '').split('?')[0];
}

/**
 * Signs many image groups (one array per auction) in a single Storage call,
 * then redistributes the results back into their original groups. Batching
 * keeps a listing of N auctions to one round-trip instead of N.
 *
 * Falls back to the original stored values if signing fails, so a Storage
 * hiccup never blanks out a listing.
 */
export async function signImageUrlGroups(
  supabase: SupabaseClient,
  groups: (string[] | null | undefined)[],
  expiresIn: number = DEFAULT_EXPIRES_IN,
): Promise<string[][]> {
  const flat: string[] = [];
  const spans = groups.map((g) => {
    const vals = g ?? [];
    const start = flat.length;
    flat.push(...vals);
    return { start, len: vals.length, vals };
  });

  if (flat.length === 0) return groups.map(() => []);

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(flat.map(toObjectPath), expiresIn);

  const signed =
    !error && data ? data.map((d, i) => d.signedUrl ?? flat[i]) : flat;

  return spans.map((s) => signed.slice(s.start, s.start + s.len));
}

/** Convenience wrapper for a single auction's image list. */
export async function signImageUrls(
  supabase: SupabaseClient,
  stored: string[] | null | undefined,
  expiresIn: number = DEFAULT_EXPIRES_IN,
): Promise<string[]> {
  const [signed] = await signImageUrlGroups(supabase, [stored], expiresIn);
  return signed;
}

/**
 * WebSocket CORS origin policy, driven by the FRONTEND_URL env var.
 *
 * - Set `FRONTEND_URL` to a single origin or a comma-separated allow-list
 *   (e.g. `https://app.example.com,https://admin.example.com`) in production.
 * - When unset (local dev) we reflect any origin so `localhost:5173` just works.
 *
 * Implemented as a callback so the env is read at REQUEST time, which avoids any
 * dependency on import/dotenv ordering at class-decoration time.
 */
export type CorsOriginCallback = (err: Error | null, allow?: boolean) => void;

export function wsCorsOrigin(
  origin: string | undefined,
  callback: CorsOriginCallback,
): void {
  const allowList = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Dev / unconfigured: allow everything (reflect the request origin).
  if (allowList.length === 0) return callback(null, true);

  // Same-origin / non-browser clients send no Origin header.
  if (!origin) return callback(null, true);

  if (allowList.includes(origin)) return callback(null, true);
  return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
}

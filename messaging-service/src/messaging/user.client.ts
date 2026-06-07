import { Injectable, Logger } from '@nestjs/common';

interface BasicUser {
  id: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Resolves display names for chat counterparts via user-service's internal
 * endpoint. Results are cached in-process to avoid hammering user-service when
 * building an inbox. Failures degrade gracefully to a shortened id.
 */
@Injectable()
export class UserClient {
  private readonly logger = new Logger(UserClient.name);
  private readonly baseUrl = process.env.USER_SERVICE_URL ?? '';
  private readonly secret = process.env.INTERNAL_SECRET ?? '';
  private readonly cache = new Map<string, string>();

  async getName(userId: string): Promise<string> {
    if (!userId) return 'Unknown';
    if (this.cache.has(userId)) return this.cache.get(userId)!;

    const fallback = `User ${String(userId).slice(0, 8)}`;
    if (!this.baseUrl) return fallback;

    try {
      const res = await fetch(`${this.baseUrl}/user/internal/${userId}`, {
        headers: { 'x-service-secret': this.secret },
      });
      if (!res.ok) return fallback;
      const u = (await res.json()) as BasicUser;
      const name =
        `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || fallback;
      this.cache.set(userId, name);
      return name;
    } catch (err) {
      this.logger.warn(
        `getName(${userId}) failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      return fallback;
    }
  }
}

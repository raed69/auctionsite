import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Thin client for crediting a user's TND balance via user-service.
 *
 * Credits go through user-service's `increment_balance` RPC, which is **atomic**
 * at the database level (race-safe under concurrent writes). This client adds
 * **retries with backoff** for transient failures so callers (deposit webhooks,
 * refunds) are safe to re-run.
 */
@Injectable()
export class UserBalanceClient {
  private readonly logger = new Logger(UserBalanceClient.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Atomically credits a user's balance, retrying transient failures.
   *
   * @param userId - the user to credit
   * @param amount - amount to add (TND)
   * @param attempts - max attempts (default 3)
   * @throws BadRequestException on a non-retryable 4xx from user-service
   * @throws ServiceUnavailableException if all attempts fail
   */
  async credit(userId: string, amount: number, attempts = 3): Promise<void> {
    const url = this.config.get<string>('USER_SERVICE_URL');
    const secret = this.config.get<string>('INTERNAL_SECRET');
    if (!url) {
      throw new ServiceUnavailableException('USER_SERVICE_URL is not configured');
    }

    let lastError = 'unknown error';
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const res = await fetch(
          `${url}/user/internal/balance/credit/${userId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'x-service-secret': secret ?? '',
            },
            body: JSON.stringify({ amount }),
          },
        );

        if (res.ok) return;

        lastError = `user-service responded ${res.status}`;
        // Client errors (bad secret/payload) won't succeed on retry — fail fast.
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          throw new BadRequestException(`Failed to credit balance: ${lastError}`);
        }
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
        lastError = (err as Error).message;
      }

      if (attempt < attempts) {
        this.logger.warn(
          `Credit attempt ${attempt}/${attempts} for user ${userId} failed (${lastError}) — retrying`,
        );
        await this.delay(200 * attempt);
      }
    }

    throw new ServiceUnavailableException(
      `Failed to credit balance after ${attempts} attempts: ${lastError}`,
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

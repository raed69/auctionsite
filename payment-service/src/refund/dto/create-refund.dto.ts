import { IsNumber, IsOptional, IsString, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRefundDto {
  /** The user to refund (e.g. the previous highest bidder who was outbid). */
  @IsString()
  @IsNotEmpty()
  userId: string;

  /** Amount to refund in TND. */
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  amount: number;

  @IsOptional()
  @IsString()
  auctionId?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  /**
   * Caller-supplied key that makes the refund idempotent. Re-sending the same
   * key never credits the user twice (requires a UNIQUE constraint on the
   * `idempotency_key` column).
   */
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}

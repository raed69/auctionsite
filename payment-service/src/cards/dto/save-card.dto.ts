import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Non-sensitive card reference. With Konnect's hosted checkout the full card
 * never reaches this service — only a gateway token plus display metadata is
 * stored. Full PAN / CVV are intentionally NOT accepted; the global
 * `forbidNonWhitelisted` ValidationPipe rejects any such extra fields.
 */
export class SaveCardDto {
  @IsOptional()
  @IsIn(['visa', 'mastercard', 'amex', 'e-DINAR', 'other'])
  brand?: string;

  /** Last 4 digits only — safe to display per PCI-DSS. */
  @IsString()
  @Matches(/^\d{4}$/, { message: 'last4 must be exactly 4 digits' })
  last4: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  expMonth: number;

  @Type(() => Number)
  @IsInt()
  @Min(2024)
  @Max(2099)
  expYear: number;

  /** Opaque gateway payment-method token — encrypted at rest, never returned. */
  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  label?: string;
}

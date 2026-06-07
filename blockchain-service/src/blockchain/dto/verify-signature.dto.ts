import { IsIn, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import type { SignatureEncoding } from '../../signature/signature.service';

export class VerifySignatureDto {
  /** base58 Solana wallet address claiming ownership. */
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  /** The exact UTF-8 message that was signed. */
  @IsString()
  @IsNotEmpty()
  message: string;

  /** The signature bytes, encoded per `encoding`. */
  @IsString()
  @IsNotEmpty()
  signature: string;

  /** Encoding of `signature` — defaults to base58. */
  @IsOptional()
  @IsIn(['base58', 'base64'])
  encoding?: SignatureEncoding;
}

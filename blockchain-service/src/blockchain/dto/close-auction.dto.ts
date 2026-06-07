import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

/**
 * Body for closing/releasing an auction's escrow. `escrowAddress` is accepted
 * for backward compatibility (the scheduler sends it) but is derived on-chain.
 */
export class CloseAuctionDto {
  @IsString()
  @IsNotEmpty()
  auctionId: string;

  @IsString()
  @IsNotEmpty()
  sellerWallet: string;

  @IsOptional()
  @IsString()
  escrowAddress?: string;
}

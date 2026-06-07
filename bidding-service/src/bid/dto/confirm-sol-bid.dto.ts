import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Sent by the frontend AFTER the buyer has signed the place-bid transaction
 * returned by POST /bids (SOL auctions). The signed transaction is relayed
 * on-chain; only once it confirms do we update the auction and record the bid.
 */
export class ConfirmSolBidDto {
  @IsString()
  @IsNotEmpty()
  auctionId: string;

  @IsString()
  @IsNotEmpty()
  bidderId: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;

  /** base64-encoded transaction signed by the buyer's Phantom wallet */
  @IsString()
  @IsNotEmpty()
  signedTransaction: string;
}

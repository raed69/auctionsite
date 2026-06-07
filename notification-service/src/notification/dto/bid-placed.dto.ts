import { IsNumber, IsString } from 'class-validator';
import { IsId } from '../../common/is-id.decorator';

/** Emitted by bidding-service after a bid is recorded — confirms it to the bidder. */
export class BidPlacedDto {
  @IsId()
  bidderId: string;

  @IsId()
  auctionId: string;

  @IsString()
  auctionTitle: string;

  @IsNumber()
  amount: number;

  @IsString()
  bidMethod: string;
}

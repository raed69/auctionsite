import { IsNumber, IsString } from 'class-validator';
import { IsId } from '../../common/is-id.decorator';

/** Emitted by bidding-service when a new bid beats the previous highest bidder. */
export class OutbidDto {
  @IsId()
  previousBidderId: string;

  @IsId()
  auctionId: string;

  @IsString()
  auctionTitle: string;

  @IsNumber()
  newAmount: number;

  @IsString()
  bidMethod: string;
}

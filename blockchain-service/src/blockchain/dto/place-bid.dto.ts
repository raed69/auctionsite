import { IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class PlaceBidDto {
  @IsString()
  @IsNotEmpty()
  bidderWallet: string;

  @IsString()
  @IsNotEmpty()
  auctionId: string;

  @IsNumber()
  bidAmountSol: number;

  @IsOptional()
  @IsString()
  previousBidderWallet?: string;
}

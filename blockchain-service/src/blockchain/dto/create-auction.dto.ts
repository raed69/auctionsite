import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateAuctionDto {
  @IsString()
  @IsNotEmpty()
  sellerWallet: string;

  @IsString()
  @IsNotEmpty()
  auctionId: string;

  @IsNumber()
  minBidSol: number;

  @IsNumber()
  endTime: number;
}

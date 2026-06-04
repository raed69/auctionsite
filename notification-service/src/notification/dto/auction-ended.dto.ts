import { IsString, IsNumber, IsUUID } from 'class-validator';

export class AuctionEndedDto {
  @IsUUID()
  auctionId: string;

  @IsString()
  auctionTitle: string;

  @IsUUID()
  winnerId: string;

  @IsUUID()
  sellerId: string;

  @IsNumber()
  winningAmount: number;

  @IsString()
  bidMethod: string;
}
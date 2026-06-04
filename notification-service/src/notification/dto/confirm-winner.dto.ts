import { IsUUID, IsNumber, IsString } from 'class-validator';

export class ConfirmWinnerDto {
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
}
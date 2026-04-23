import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBidDto {
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
}
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAuctionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  startingPrice: number;

  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}

import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDraftAuctionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
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

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  images?: Express.Multer.File[];

  @IsOptional()
  @IsIn(['new', 'like_new', 'used', 'damaged'])
  condition?: 'new' | 'like_new' | 'used' | 'damaged';

  // ✅ Fixed typo: bidmethode → bidMethod + added validator
  @IsOptional()
  @IsIn(['TND', 'SOL'], {
    message: 'Bid method must be either TND or SOL',
  })
  bidMethod?: 'TND' | 'SOL';

  // ✅ NEW: required only for SOL auctions
  @IsOptional()
  @IsString()
  sellerWallet?: string;
}
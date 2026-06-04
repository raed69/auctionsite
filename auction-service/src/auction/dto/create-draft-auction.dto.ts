/* eslint-disable prettier/prettier */
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
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export const AUCTION_CATEGORIES = [
  'art',
  'collectibles',
  'electronics',
  'jewelry',
  'furniture',
  'vehicles',
  'fashion',
  'pets_and_animals',
] as const;

export type AuctionCategory = (typeof AUCTION_CATEGORIES)[number];

export class CreateDraftAuctionDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  title: string;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(AUCTION_CATEGORIES)
  category?: AuctionCategory;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  startingPrice: number;

  @IsOptional()
  @IsString()
  sellerId: string;

  @Transform(({ value }) => value?.trim())
  @IsDateString()
  startTime: string;

  @Transform(({ value }) => value?.trim())
  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  images?: Express.Multer.File[];

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsIn(['new', 'like_new', 'used', 'damaged'])
  condition?: 'new' | 'like_new' | 'used' | 'damaged';

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsIn(['TND', 'SOL'], { message: 'Bid method must be either TND or SOL' })
  bidMethod?: 'TND' | 'SOL';

  // ← No longer required from client — service reads it from user DB
  @IsOptional()
  @IsString()
  sellerWallet?: string;
}
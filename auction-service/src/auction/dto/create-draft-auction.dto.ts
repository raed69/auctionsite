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
import { IsRequiredIf } from 'src/common/decorators/is-required-if.decorator';

// ✅ Define BOTH the array and the type here
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

export type AuctionCategory = (typeof AUCTION_CATEGORIES)[number]; // ← RIGHT HERE, after the array

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
  category?: AuctionCategory; // ← now recognized

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  startingPrice: number;

  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
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
  @IsIn(['TND', 'SOL'], {
    message: 'Bid method must be either TND or SOL',
  })
  bidMethod?: 'TND' | 'SOL';

  @IsOptional()
  @IsString()
  @IsRequiredIf('bidMethod', 'SOL', {
    message: 'sellerWallet is required for SOL auctions',
  })
  sellerWallet?: string;
}
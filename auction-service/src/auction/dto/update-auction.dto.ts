import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AUCTION_CATEGORIES } from './create-realtime-auction.dto';
import type { AuctionCategory } from './create-realtime-auction.dto';

/**
 * Editable auction fields. Currency (bidMethod), seller and on-chain fields are
 * intentionally immutable. Edits are rejected by the service once the auction is
 * locked (TND: after the first bid; SOL: after escrow creation).
 */
export class UpdateAuctionDto {
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @Transform(({ value }) => value?.trim())
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(AUCTION_CATEGORIES)
  category?: AuctionCategory;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  startingPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  reservePrice?: number;

  @IsOptional()
  @IsIn(['new', 'like_new', 'used', 'damaged'])
  condition?: 'new' | 'like_new' | 'used' | 'damaged';

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;
}

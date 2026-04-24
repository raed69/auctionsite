import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsArray,
  ArrayNotEmpty,
  IsIn,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsRequiredIf } from 'src/common/decorators/is-required-if.decorator';

export class CreateRealtimeAuctionDto {
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
  endTime: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  images?: Express.Multer.File[];

  @IsOptional()
  @IsIn(['new', 'like_new', 'used', 'damaged'])
  condition?: 'new' | 'like_new' | 'used' | 'damaged';

  @Transform(({ value }) => value?.trim())  // ← add this
  @IsIn(['TND', 'SOL'], {
    message: 'Bid method must be either TND or SOL',
  })
  bidMethod: 'TND' | 'SOL';


  @IsString()
  @IsRequiredIf('bidMethod', 'SOL', {
    message: 'sellerWallet is required for SOL auctions',
  })
  sellerWallet?: string;
}
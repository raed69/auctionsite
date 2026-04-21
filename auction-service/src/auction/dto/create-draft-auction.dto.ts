import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsIn
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

  @IsOptional()  // Makes condition optional, you can remove this if it's required
  @IsIn(['new', 'like_new', 'used', 'damaged'], { message: 'condition must be one of the following values: new, like_new, used, damaged' })
  condition?: 'new' | 'like_new' | 'used' | 'damaged';  // Adds condition with specific values
}


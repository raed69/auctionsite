import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsArray,
  ArrayNotEmpty,
  IsIn, // Import IsIn to validate specific values
} from 'class-validator';
import { Type } from 'class-transformer';
import * as multer from 'multer'; // Import multer

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

  // Multiple images
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  images?: Express.Multer.File[]; // Use multer.File[] here

  // Condition field
  @IsOptional() // Makes condition optional, you can remove this if it's required
  @IsIn(['new', 'like_new', 'used', 'damaged'], {
    message:
      'condition must be one of the following values: new, like_new, used, damaged',
  })
  condition?: 'new' | 'like_new' | 'used' | 'damaged'; // Adds condition with specific values
}

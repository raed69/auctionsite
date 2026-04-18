import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
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
  }
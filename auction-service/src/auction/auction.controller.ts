import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuctionService } from './auction.service';
import { CreateRealtimeAuctionDto } from './dto/create-realtime-auction.dto';
import { CreateDraftAuctionDto } from './dto/create-draft-auction.dto';
import type { Auction } from './interfaces/auction.interface';
import { memoryStorage } from 'multer';

class CloseAuctionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

class DeleteAuctionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

class DeleteAllAuctionsDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

@Controller('auctions')
export class AuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post('realtime')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: memoryStorage(), // explicitly store files in memory as buffer
    }),
  )
  async createRealtimeAuction(
    @Body() dto: CreateRealtimeAuctionDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    console.log('Received images:', images);
    return await this.auctionService.createRealtimeAuction(dto, images);
  }

  @Post('draft')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: memoryStorage(),
    }),
  )
  async createDraftAuction(
    @Body() dto: CreateDraftAuctionDto,
    @UploadedFiles() images: Express.Multer.File[] = [],
  ) {
    return await this.auctionService.createDraftAuction(dto, images);
  }

  @Get()
  async getAllAuctions(): Promise<Auction[]> {
    return await this.auctionService.getAllAuctions();
  }

  @Get(':id')
  async getAuctionById(@Param('id') id: string): Promise<Auction> {
    return await this.auctionService.getAuctionById(id);
  }

  @Patch(':id/close')
  async closeAuction(
    @Param('id') id: string,
    @Body() body: CloseAuctionDto,
  ): Promise<Auction> {
    return await this.auctionService.closeAuction(id, body.userId);
  }

  @Delete(':id')
  async deleteAuctionById(
    @Param('id') id: string,
    @Body() body: DeleteAuctionDto,
  ): Promise<{ message: string }> {
    return await this.auctionService.deleteAuctionById(id, body.userId);
  }

  @Delete()
  async deleteAllAuctions(
    @Body() body: DeleteAllAuctionsDto,
  ): Promise<{ message: string; deletedCount: number }> {
    return await this.auctionService.deleteAllAuctions(body.userId);
  }
  @Patch(':id/bid')
  async updateAuctionAfterBid(
    @Param('id') id: string,
    @Body() body: { amount: number; bidderId: string },
  ) {
    return this.auctionService.updateAuctionAfterBid(
      id,
      body.amount,
      body.bidderId,
    );
  }
}

/* eslint-disable prettier/prettier */
import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    ServiceUnavailableException,
  } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import { CreateRealtimeAuctionDto } from './dto/create-realtime-auction.dto';
  import { CreateDraftAuctionDto } from './dto/create-draft-auction.dto';
  import { SupabaseService } from '../supabase/supabase.service';
  import type { Auction } from './interfaces/auction.interface';
import { uploadImageToSupabase } from './utils/uploadImagTosupabase';
  
  interface UserResponse {
    id: string | number;
    role: string;
    email?: string;
  }
  
  type AuctionRow = {
    id: string;
    title: string;
    description: string | null;
    image_urls?: string[];
    condition?: 'new' | 'like_new' | 'used' | 'damaged';
    starting_price: number | string;
    current_price: number | string;
    seller_id: string;
    highest_bidder_id: string | null;
    winner_id: string | null;
    bid_count: number | string;
    start_time: string;
    end_time: string;
    status: 'draft' | 'active' | 'ended';
    created_at: string;
    updated_at: string | null;
    closed_at: string | null;
    bid_method: 'TND' | 'SOL';
    escrow_address: string | null; 
    sellerwallet:string | null;
    solana_auction_id: string | null;
    
  };
  @Injectable()
  export class AuctionService {
    constructor(
      private readonly supabaseService: SupabaseService,
      private readonly configService: ConfigService,
    ) {}
  
    async createRealtimeAuction(
      dto: CreateRealtimeAuctionDto,
      images: Express.Multer.File[],
    ): Promise<{ auction: Auction; blockchainTransaction?: string; escrowAddress?: string }> {
      const supabase = this.supabaseService.getClient();
      const now = new Date();
      const end = new Date(dto.endTime);
    
      if (end <= now) {
        throw new BadRequestException('endTime must be in the future');
      }
    
      if (dto.bidMethod === 'SOL' && !dto.sellerWallet) {
        throw new BadRequestException('sellerWallet is required for SOL auctions');
      }
    
      const user = await this.getUserFromUserService(dto.sellerId);
      if (user.role !== 'seller') {
        throw new ForbiddenException('Only users with seller role can create auctions');
      }
    
      // Upload images
      const imageUrls: string[] = [];
      if (images && images.length > 0) {
        for (const image of images) {
          try {
            const imageUrl = await uploadImageToSupabase(image, this.supabaseService);
            imageUrls.push(imageUrl);
          } catch (error) {
            console.error('Error uploading image:', error);
            continue;
          }
        }
      }
    
      // Insert auction into Supabase
      const { data, error } = await supabase
        .from('auctions')
        .insert({
          title: dto.title,
          description: dto.description ?? null,
          condition: dto.condition,
          starting_price: dto.startingPrice,
          current_price: dto.startingPrice,
          seller_id: String(dto.sellerId),
          start_time: now.toISOString(),
          end_time: dto.endTime,
          status: 'active',
          highest_bidder_id: null,
          winner_id: null,
          bid_count: 0,
          updated_at: new Date().toISOString(),
          closed_at: null,
          image_urls: imageUrls,
          bid_method: dto.bidMethod,
          escrow_address: null,
          solana_auction_id: null,
          sellerwallet: dto.sellerWallet ?? null,
        })
        .select()
        .single();
    
      if (error || !data) {
        throw new BadRequestException(error?.message || 'Failed to create realtime auction');
      }
    
      const auction = this.mapAuction(data as AuctionRow);
    
      // ✅ SOL auction — call blockchain-service
      if (dto.bidMethod === 'SOL') {
        try {
          const endTimeUnix = Math.floor(end.getTime() / 1000);
    
          // ✅ Truncate UUID to max 32 bytes for Solana PDA seed
          const solanaAuctionId = auction.id!.replace(/-/g, '').substring(0, 32);
    
          const blockchainRes = await fetch(
            `${process.env.BLOCKCHAIN_SERVICE_URL}/blockchain/createAuction`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sellerWallet: dto.sellerWallet,
                auctionId: solanaAuctionId,
                minBidSol: dto.startingPrice,
                endTime: endTimeUnix,
              }),
            },
          );
    
          const blockchainData = await blockchainRes.json();
    
          if (blockchainData.error) {
            // Rollback — delete auction from Supabase if blockchain fails
            await supabase.from('auctions').delete().eq('id', auction.id);
            throw new BadRequestException(`Blockchain error: ${blockchainData.error}`);
          }
    
          // Save escrow address and solanaAuctionId to Supabase
          await supabase
            .from('auctions')
            .update({
              escrow_address: blockchainData.escrowAddress,
              solana_auction_id: solanaAuctionId, // ✅ save for future bid references
            })
            .eq('id', auction.id);
    
          return {
            auction: {
              ...auction,
              escrow_address: blockchainData.escrowAddress,
              solana_auction_id: solanaAuctionId,
            },
            blockchainTransaction: blockchainData.transaction,
            escrowAddress: blockchainData.escrowAddress,
          };
    
        } catch (err) {
          throw new BadRequestException('Failed to initialize blockchain auction: ' + err.message);
        }
      }
    
      // TND auction — return just the auction
      return { auction };
    }
      
  
      async createDraftAuction(
        dto: CreateDraftAuctionDto,
        images: Express.Multer.File[],  // Accept multiple images here
      ): Promise<Auction> {
        const supabase = this.supabaseService.getClient();
        const now = new Date();
        const start = new Date(dto.startTime);
        const end = new Date(dto.endTime);
      
        // Ensure that the draft auction's start time is in the future
        if (start <= now) {
          throw new BadRequestException('For draft auctions, startTime must be in the future');
        }
      
        // Ensure the auction's end time is greater than start time
        if (end <= start) {
          throw new BadRequestException('endTime must be greater than startTime');
        }
      
        // Ensure the user has the 'seller' role
        const user = await this.getUserFromUserService(dto.sellerId);
        if (user.role !== 'seller') {
          throw new ForbiddenException('Only users with seller role can create auctions');
        }
      
        // Handle the image uploads and collect their URLs
        const imageUrls: string[] = [];
        console.log('Images to upload:', images);
      
        if (images && images.length > 0) {
          for (const image of images) {
            console.log('Uploading image:', image.originalname);  // Log the image being processed
            const imageUrl = await uploadImageToSupabase(image, this.supabaseService);// Upload image and get URL
            console.log('Uploaded image URL:', imageUrl);  // Log the URL of the uploaded image
            imageUrls.push(imageUrl);  // Add the image URL to the array
          }
        }
      
        // Insert the auction into Supabase with the image URLs
        const { data, error } = await supabase
          .from('auctions')
          .insert({
            title: dto.title,
            description: dto.description ?? null,
            condition: dto.condition,
            starting_price: dto.startingPrice,
            current_price: dto.startingPrice,
            seller_id: String(dto.sellerId),
            start_time: dto.startTime,
            end_time: dto.endTime,
            status: 'draft',  // Set the auction status to 'draft'
            highest_bidder_id: null,
            winner_id: null,
            bid_count: 0,
            updated_at: new Date().toISOString(),
            closed_at: null,
            image_urls: imageUrls,  // Store the array of image URLs in the database
          })
          .select()
          .single();
      
        // Handle any error from Supabase insertion
        if (error || !data) {
          throw new BadRequestException(error?.message || 'Failed to create draft auction');
        }
      
        return this.mapAuction(data as AuctionRow);  // Return the mapped auction data
      }
    async getAllAuctions(): Promise<Auction[]> {
        const { data, error } = await this.supabaseService
          .getClient()
          .from('auctions')
          .select('*')
          .order('created_at', { ascending: false });
      
        if (error) {
          throw new BadRequestException(error.message);
        }
      
        const rows = (data ?? []) as AuctionRow[];
        const refreshedAuctions: Auction[] = [];
      
        for (const row of rows) {
          const refreshed = await this.refreshAuctionStatus(row);
          refreshedAuctions.push(refreshed);
        }
      
        return refreshedAuctions;
      }
  
    async getAuctionById(id: string): Promise<Auction> {
        const row = await this.getAuctionRowById(id);
        return await this.refreshAuctionStatus(row);
      }
  
    async closeAuction(
      id: string,
      currentUserId: string,
    ): Promise<Auction> {
      const row = await this.getAuctionRowById(id);
      const user = await this.getUserFromUserService(currentUserId);
  
      const isOwner = String(row.seller_id).trim() === String(currentUserId).trim();
      const normalizedRole = String(user.role).trim().toLowerCase();
  
      const isAdmin = normalizedRole === 'admin';
      const isSellerOwner = normalizedRole === 'seller' && isOwner;
  
      if (!isSellerOwner && !isAdmin) {
        throw new ForbiddenException(
          'Only the seller who created the auction or an admin can close it',
        );
      }
  
      if (row.status === 'ended') {
        return this.mapAuction(row);
      }
  
      const { data, error } = await this.supabaseService
        .getClient()
        .from('auctions')
        .update({ status: 'ended' })
        .eq('id', id)
        .select()
        .single();
  
      if (error || !data) {
        throw new NotFoundException('Auction not found');
      }
  
      return this.mapAuction(data as AuctionRow);
    }
  
    private async getAuctionRowById(id: string): Promise<AuctionRow> {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('auctions')
        .select('*')
        .eq('id', id)
        .single();
  
      if (error || !data) {
        throw new NotFoundException('Auction not found');
      }
  
      return data as AuctionRow;
    }
  
    private async getUserFromUserService(userId: string): Promise<UserResponse> {
      const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');
  
      if (!userServiceUrl) {
        throw new BadRequestException('USER_SERVICE_URL is not configured');
      }
  
      try {
        const response = await fetch(`${userServiceUrl}/user/${userId}`);
  
        if (!response.ok) {
          if (response.status === 404) {
            throw new NotFoundException('Seller not found in user-service');
          }
  
          throw new ServiceUnavailableException(
            'Failed to verify user from user-service',
          );
        }
  
        return (await response.json()) as UserResponse;
      } catch {
        throw new ServiceUnavailableException('Could not connect to user-service');
      }
    }
  
    private mapAuction(row: AuctionRow): Auction {
        return {
          id: row.id,
          title: row.title,
          description: row.description ?? undefined,
          starting_price: Number(row.starting_price),
          current_price: Number(row.current_price),
          seller_id: row.seller_id,
          condition:row.condition,
          highest_bidder_id: row.highest_bidder_id ?? null,
          winner_id: row.winner_id ?? null,
          bid_count: Number(row.bid_count ?? 0),
      
          startTime: row.start_time,
          endTime: row.end_time,
          status: row.status,
      
          createdAt: row.created_at,
          updatedAt: row.updated_at ?? undefined,
          closedAt: row.closed_at ?? null,
          image_urls: row.image_urls ?? [] ,
          bidmethod:row.bid_method ??null ,
          escrow_address: row.escrow_address ?? null,
          sellerwallet:row.sellerwallet ?? null ,
          solana_auction_id: row.solana_auction_id ?? null,
        };
      }

    private async refreshAuctionStatus(row: AuctionRow): Promise<Auction> {
        const now = new Date();
        const start = new Date(row.start_time);
        const end = new Date(row.end_time);
      
        // draft -> active
        if (row.status === 'draft' && start <= now && end > now) {
          const { data, error } = await this.supabaseService
            .getClient()
            .from('auctions')
            .update({ status: 'active' })
            .eq('id', row.id)
            .select()
            .single();
      
          if (error || !data) {
            throw new NotFoundException('Auction not found');
          }
      
          return this.mapAuction(data as AuctionRow);
        }
      
        // active or draft -> ended
        if (row.status !== 'ended' && end <= now) {
          const { data, error } = await this.supabaseService
            .getClient()
            .from('auctions')
            .update({ status: 'ended' })
            .eq('id', row.id)
            .select()
            .single();
      
          if (error || !data) {
            throw new NotFoundException('Auction not found');
          }
      
          return this.mapAuction(data as AuctionRow);
        }
      
        return this.mapAuction(row);
      }
      async deleteAuctionById(
        id: string,
        currentUserId: string,
      ): Promise<{ message: string }> {
        const row = await this.getAuctionRowById(id);
        const user = await this.getUserFromUserService(currentUserId);
      
        const isOwner = String(row.seller_id).trim() === String(currentUserId).trim();
        const normalizedRole = String(user.role).trim().toLowerCase();
      
        const isAdmin = normalizedRole === 'admin';
        const isSellerOwner = normalizedRole === 'seller' && isOwner;
      
        if (!isSellerOwner && !isAdmin) {
          throw new ForbiddenException(
            'Only the seller who created the auction or an admin can delete it',
          );
        }
      
        const { error } = await this.supabaseService
          .getClient()
          .from('auctions')
          .delete()
          .eq('id', id);
      
        if (error) {
          throw new BadRequestException(error.message);
        }
      
        return { message: 'Auction deleted successfully' };
      }
      
      async deleteAllAuctions(
        currentUserId: string,
      ): Promise<{ message: string; deletedCount: number }> {
        const user = await this.getUserFromUserService(currentUserId);
        const normalizedRole = String(user.role).trim().toLowerCase();
      
      /*  if (normalizedRole !== 'admin') {
          throw new ForbiddenException('Only admin can delete all auctions');
        }
      */
        const { data: existingAuctions, error: fetchError } = await this.supabaseService
          .getClient()
          .from('auctions')
          .select('id');
      
        if (fetchError) {
          throw new BadRequestException(fetchError.message);
        }
      
        const deletedCount = existingAuctions?.length ?? 0;
      
        const { error } = await this.supabaseService
          .getClient()
          .from('auctions')
          .delete()
          .neq('id', '');
      
        if (error) {
          throw new BadRequestException(error.message);
        }
      
        return {
          message: 'All auctions deleted successfully',
          deletedCount,
        };
      }
      async updateAuctionAfterBid(
        auctionId: string,
        amount: number,
        bidderId: string,
      ): Promise<Auction> {
        const auction = await this.getAuctionById(auctionId);
      
        if (!auction) {
          throw new Error('Auction not found');
        }
      
        const supabase = this.supabaseService.getClient();
      
        const { data, error } = await supabase
          .from('auctions')
          .update({
            current_price: amount,
            highest_bidder_id: String(bidderId),
            bid_count: Number(auction.bid_count || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', auctionId)
          .select()
          .single();
      
        if (error) {
          console.log('updateAuctionAfterBid error:', error);
          throw new Error(error.message);
        }
      
        return this.mapAuction(data);
      }

  }
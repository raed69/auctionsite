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
  
  interface UserResponse {
    id: string | number;
    role: string;
    email?: string;
  }
  
  type AuctionRow = {
    id: string;
    title: string;
    description: string | null;
    starting_price: number | string;
    current_price: number | string;
    seller_id: string;
    start_time: string;
    end_time: string;
    status: 'draft' | 'active' | 'ended';
    created_at: string;
  };
  
  @Injectable()
  export class AuctionService {
    constructor(
      private readonly supabaseService: SupabaseService,
      private readonly configService: ConfigService,
    ) {}
  
    async createRealtimeAuction(
      dto: CreateRealtimeAuctionDto,
    ): Promise<Auction> {
      const supabase = this.supabaseService.getClient();
      const now = new Date();
      const end = new Date(dto.endTime);
  
      if (end <= now) {
        throw new BadRequestException('endTime must be in the future');
      }
  
      const user = await this.getUserFromUserService(dto.sellerId);
  
      if (user.role !== 'seller') {
        throw new ForbiddenException(
          'Only users with seller role can create auctions',
        );
      }
  
      const { data, error } = await supabase
        .from('auctions')
        .insert({
          title: dto.title,
          description: dto.description ?? null,
          starting_price: dto.startingPrice,
          current_price: dto.startingPrice,
          seller_id: String(dto.sellerId),
          start_time: now.toISOString(),
          end_time: dto.endTime,
          status: 'active',
        })
        .select()
        .single();
  
      if (error || !data) {
        throw new BadRequestException(
          error?.message || 'Failed to create realtime auction',
        );
      }
  
      return this.mapAuction(data as AuctionRow);
    }
  
    async createDraftAuction(
      dto: CreateDraftAuctionDto,
    ): Promise<Auction> {
      const supabase = this.supabaseService.getClient();
      const now = new Date();
      const start = new Date(dto.startTime);
      const end = new Date(dto.endTime);
  
      if (start <= now) {
        throw new BadRequestException(
          'For draft auctions, startTime must be in the future',
        );
      }
  
      if (end <= start) {
        throw new BadRequestException('endTime must be greater than startTime');
      }
  
      const user = await this.getUserFromUserService(dto.sellerId);
  
      if (user.role !== 'seller') {
        throw new ForbiddenException(
          'Only users with seller role can create auctions',
        );
      }
  
      const { data, error } = await supabase
        .from('auctions')
        .insert({
          title: dto.title,
          description: dto.description ?? null,
          starting_price: dto.startingPrice,
          current_price: dto.startingPrice,
          seller_id: String(dto.sellerId),
          start_time: dto.startTime,
          end_time: dto.endTime,
          status: 'draft',
        })
        .select()
        .single();
  
      if (error || !data) {
        throw new BadRequestException(
          error?.message || 'Failed to create draft auction',
        );
      }
  
      return this.mapAuction(data as AuctionRow);
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
        startTime: row.start_time,
        endTime: row.end_time,
        status: row.status,
        createdAt: row.created_at,
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
      
        if (normalizedRole !== 'admin') {
          throw new ForbiddenException('Only admin can delete all auctions');
        }
      
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

  }
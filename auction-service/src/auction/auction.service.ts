/* eslint-disable prettier/prettier */
import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { SupabaseService } from '../supabase/supabase.service';
import type { Auction } from './interfaces/auction.interface';

interface UserResponse {
  id: string;
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

  async createAuction(createAuctionDto: CreateAuctionDto): Promise<Auction> {
    const supabase = this.supabaseService.getClient();

    const start = new Date(createAuctionDto.startTime);
    const end = new Date(createAuctionDto.endTime);
    const now = new Date();

    if (end <= start) {
      throw new BadRequestException('endTime must be greater than startTime');
    }

    if (end <= now) {
      throw new BadRequestException('endTime must be in the future');
    }

    const user = await this.getUserFromUserService(createAuctionDto.sellerId);

    if (user.role !== 'seller') {
      throw new ForbiddenException(
        'Only users with seller role can create auctions',
      );
    }

    const status: 'draft' | 'active' = start > now ? 'draft' : 'active';

    const { data, error } = await supabase
      .from('auctions')
      .insert({
        title: createAuctionDto.title,
        description: createAuctionDto.description ?? null,
        starting_price: createAuctionDto.startingPrice,
        current_price: createAuctionDto.startingPrice,
        seller_id: String(createAuctionDto.sellerId),
        start_time: createAuctionDto.startTime,
        end_time: createAuctionDto.endTime,
        status,
      })
      .select()
      .single();

    if (error || !data) {
      throw new BadRequestException(
        error?.message || 'Failed to create auction',
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

    return (data ?? []).map((row) => this.mapAuction(row));
  }

  async getAuctionById(id: string): Promise<Auction> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('auctions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Auction not found');
    }

    return this.mapAuction(data);
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
  async closeAuction(
    id: string,
    currentUserId: string,
  ): Promise<Auction> {
    const row = await this.getAuctionRowById(id);
  
    const user = await this.getUserFromUserService(currentUserId);
  
    console.log('Auction seller_id:', row.seller_id);
    console.log('Current userId:', currentUserId);
    console.log('Fetched user role:', user.role);
    console.log('Auction current status:', row.status);
  
    const isOwner = String(row.seller_id).trim() === String(currentUserId).trim();
    const normalizedRole = String(user.role).trim().toLowerCase();
  
    const isAdmin = normalizedRole === 'admin';
    const isSellerOwner = normalizedRole === 'seller' && isOwner;
  
    console.log('isOwner:', isOwner);
    console.log('isAdmin:', isAdmin);
    console.log('isSellerOwner:', isSellerOwner);
  
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

  async closeAuctionBySystem(id: string): Promise<Auction> {
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

  private async getUserFromUserService(userId: string) {
    const userServiceUrl = this.configService.get<string>('USER_SERVICE_URL');

    if (!userServiceUrl) {
      throw new BadRequestException('USER_SERVICE_URL is not configured');
    }

    const response = await fetch(`${userServiceUrl}/user/${userId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new NotFoundException('Seller not found in user-service');
      }
      throw new BadRequestException(
        'Failed to verify seller from user-service',
      );
    }

    return await response.json();
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
}

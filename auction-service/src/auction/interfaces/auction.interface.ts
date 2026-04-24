export interface Auction {
  id?: string;
  title: string;
  description?: string;
  image_urls?: string[];
  starting_price: number;
  current_price: number;
  condition?: 'new' | 'like_new' | 'used' | 'damaged';
  seller_id: string;
  highest_bidder_id?: string | null;
  winner_id?: string | null;

  bid_count: number;

  startTime: string;
  endTime: string;

  status: 'draft' | 'active' | 'ended';

  createdAt?: string;
  updatedAt?: string;
  closedAt?: string | null;
  bidmethod: 'TND' | 'SOL';
  escrow_address?: string | null;
  sellerwallet?: string | null;
  solana_auction_id?: string | null;
}

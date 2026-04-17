export interface Bid {
  id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
  updated_at?: string;
}

export interface Auction {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  starting_price: number;
  current_highest_bid?: number;
  status: 'active' | 'closed' | 'cancelled';
  start_time: string;
  end_time: string;
  created_at: string;
  updated_at?: string;
}

export interface Auction {
  id?: string;
  title: string;
  description?: string;
  starting_price: number;
  current_price: number;
  seller_id: string;
  startTime: string;
  endTime: string;
  status: 'draft' | 'active' | 'ended';
  createdAt?: string;
}

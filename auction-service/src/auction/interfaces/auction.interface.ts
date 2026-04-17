export interface Auction {
  id?: string;
  title: string;
  description?: string;
  startingPrice: number;
  currentPrice: number;
  sellerId: string;
  startTime: string;
  endTime: string;
  status: 'draft' | 'active' | 'ended';
  createdAt?: string;
}

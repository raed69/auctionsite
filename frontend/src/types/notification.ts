export type NotificationType = 'outbid' | 'new_bid' | 'ending_soon' | 'won';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  auctionTitle: string;
  auctionId: string;
  timeAgo: string;
  read: boolean;
}

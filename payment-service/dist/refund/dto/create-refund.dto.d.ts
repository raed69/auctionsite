export declare class CreateRefundDto {
    userId: string;
    amount: number;
    auctionId?: string;
    reason?: string;
    idempotencyKey?: string;
}

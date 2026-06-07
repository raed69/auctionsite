import { UserBalanceClient } from '../common/user-balance.client';
import { CreateRefundDto } from './dto/create-refund.dto';
export declare class RefundService {
    private readonly userBalance;
    private readonly logger;
    constructor(userBalance: UserBalanceClient);
    createRefund(dto: CreateRefundDto): Promise<any>;
    getRefund(id: string): Promise<any>;
    private findOrCreate;
}

import { ConfigService } from '@nestjs/config';
import { InitiateWithdrawDto } from './dto/initiate-withdraw.dto';
export declare class WithdrawService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    private generateRef;
    initiateWithdraw(dto: InitiateWithdrawDto, sellerId: string): Promise<{
        message: string;
        ref: string;
        amount: number;
        status: string;
        withdrawal: any;
    }>;
    getWithdrawStatus(ref: string): Promise<any>;
    completeWithdraw(ref: string): Promise<{
        message: string;
        withdrawal: any;
    }>;
    getAllWithdrawals(): Promise<any[]>;
}

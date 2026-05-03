import { WithdrawService } from './withdraw.service';
import { InitiateWithdrawDto } from './dto/initiate-withdraw.dto';
export declare class WithdrawController {
    private readonly withdrawService;
    constructor(withdrawService: WithdrawService);
    initiateWithdraw(dto: InitiateWithdrawDto, req: any): Promise<{
        message: string;
        ref: string;
        amount: number;
        status: string;
        withdrawal: any;
    }>;
    getStatus(ref: string): Promise<any>;
    getAllWithdrawals(): Promise<any[]>;
    completeWithdraw(ref: string): Promise<{
        message: string;
        withdrawal: any;
    }>;
}

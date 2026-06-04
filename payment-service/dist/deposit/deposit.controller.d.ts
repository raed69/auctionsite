import { DepositService } from './deposit.service';
export declare class DepositController {
    private readonly depositService;
    constructor(depositService: DepositService);
    initiate(req: any, body: {
        amount: number;
    }): Promise<{
        paymentUrl: string;
        paymentRef: string;
        deposit: any;
    }>;
    webhook(body: any): Promise<{
        received: boolean;
    }>;
    mockPay(paymentRef: string): Promise<{
        received: boolean;
    }>;
    status(paymentRef: string): Promise<any>;
}

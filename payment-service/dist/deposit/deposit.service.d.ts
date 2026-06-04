import { ConfigService } from '@nestjs/config';
import { InitiateDepositDto } from '../payment/dto/initiate-deposit.dto';
export declare class DepositService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    private generateRef;
    initiateDeposit(dto: InitiateDepositDto): Promise<{
        paymentUrl: string;
        paymentRef: string;
        deposit: any;
    }>;
    handleDepositWebhook(body: any): Promise<{
        received: boolean;
    }>;
    mockPay(paymentRef: string): Promise<{
        received: boolean;
    }>;
    getDepositStatus(paymentRef: string): Promise<any>;
    private creditBuyer;
}

import { ConfigService } from '@nestjs/config';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
export declare class PaymentService {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    private generateRef;
    initiatePayment(dto: InitiatePaymentDto): Promise<{
        paymentUrl: string;
        paymentRef: string;
        payment: any;
    }>;
    handleWebhook(body: any): Promise<{
        received: boolean;
    }>;
    mockPay(paymentRef: string): Promise<{
        received: boolean;
    }>;
    getPaymentStatus(paymentRef: string): Promise<any>;
    private creditSeller;
    private notifySeller;
}

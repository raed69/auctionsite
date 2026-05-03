import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    initiate(dto: InitiatePaymentDto): Promise<{
        paymentUrl: string;
        paymentRef: string;
        payment: any;
    }>;
    webhook(body: any): Promise<{
        received: boolean;
    }>;
    mockPay(paymentRef: string): Promise<{
        received: boolean;
    }>;
    status(paymentRef: string): Promise<any>;
}

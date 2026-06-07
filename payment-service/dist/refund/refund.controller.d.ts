import { RefundService } from './refund.service';
import { CreateRefundDto } from './dto/create-refund.dto';
export declare class RefundController {
    private readonly refundService;
    constructor(refundService: RefundService);
    create(dto: CreateRefundDto): Promise<any>;
    get(id: string): Promise<any>;
}

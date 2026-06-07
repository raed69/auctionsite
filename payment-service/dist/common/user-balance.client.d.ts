import { ConfigService } from '@nestjs/config';
export declare class UserBalanceClient {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    credit(userId: string, amount: number, attempts?: number): Promise<void>;
    private delay;
}

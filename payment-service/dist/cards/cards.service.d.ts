import { SaveCardDto } from './dto/save-card.dto';
export declare class CardsService {
    private readonly logger;
    private readonly publicColumns;
    saveCard(userId: string, dto: SaveCardDto): Promise<{
        id: any;
        brand: any;
        last4: any;
        masked: string;
        exp_month: any;
        exp_year: any;
        label: any;
        created_at: any;
    }>;
    hasCards(userId: string): Promise<boolean>;
    listCards(userId: string): Promise<{
        id: any;
        brand: any;
        last4: any;
        masked: string;
        exp_month: any;
        exp_year: any;
        label: any;
        created_at: any;
    }[]>;
    deleteCard(userId: string, id: string): Promise<{
        message: string;
    }>;
    private present;
}

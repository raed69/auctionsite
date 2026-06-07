import { CardsService } from './cards.service';
import { SaveCardDto } from './dto/save-card.dto';
export declare class CardsController {
    private readonly cardsService;
    constructor(cardsService: CardsService);
    save(req: any, dto: SaveCardDto): Promise<{
        id: any;
        brand: any;
        last4: any;
        masked: string;
        exp_month: any;
        exp_year: any;
        label: any;
        created_at: any;
    }>;
    list(req: any): Promise<{
        id: any;
        brand: any;
        last4: any;
        masked: string;
        exp_month: any;
        exp_year: any;
        label: any;
        created_at: any;
    }[]>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
}

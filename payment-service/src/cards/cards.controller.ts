import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { SaveCardDto } from './dto/save-card.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Buyer's saved payment methods. All routes require a valid JWT and operate
 * only on the authenticated user's own cards.
 */
@Controller('payments/cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  /** Saves a card reference (metadata + optional encrypted gateway token). */
  @Post()
  save(@Request() req: any, @Body() dto: SaveCardDto) {
    return this.cardsService.saveCard(String(req.user.id), dto);
  }

  /** Lists the user's saved cards (masked). */
  @Get()
  list(@Request() req: any) {
    return this.cardsService.listCards(String(req.user.id));
  }

  /** Removes one of the user's saved cards. */
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.cardsService.deleteCard(String(req.user.id), id);
  }
}

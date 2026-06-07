import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RefundService } from './refund.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { ServiceSecretGuard } from '../auth/service-secret.guard';

/**
 * Internal (service-to-service) refund endpoints. Protected by
 * {@link ServiceSecretGuard} — called e.g. by bidding-service when a buyer is
 * outbid, not by end users.
 */
@Controller('payments/refund')
@UseGuards(ServiceSecretGuard)
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  /** Records and processes a TND refund (idempotent on `idempotencyKey`). */
  @Post()
  create(@Body() dto: CreateRefundDto) {
    return this.refundService.createRefund(dto);
  }

  /** Returns a refund's tracked status. */
  @Get(':id')
  get(@Param('id') id: string) {
    return this.refundService.getRefund(id);
  }
}

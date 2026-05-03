import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments/deposit')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  initiate(@Request() req, @Body() body: { amount: number }) {
    return this.depositService.initiateDeposit({
      buyerId: String(req.user.id),
      amount: body.amount,
    });
  }

  @Post('webhook')
  webhook(@Body() body: any) {
    return this.depositService.handleDepositWebhook(body);
  }

  @Get('mock-pay/:paymentRef')
  mockPay(@Param('paymentRef') paymentRef: string) {
    return this.depositService.mockPay(paymentRef);
  }

  @Get('status/:paymentRef')
  @UseGuards(JwtAuthGuard)
  status(@Param('paymentRef') paymentRef: string) {
    return this.depositService.getDepositStatus(paymentRef);
  }
}
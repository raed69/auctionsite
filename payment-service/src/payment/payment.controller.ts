import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  initiate(@Body() dto: InitiatePaymentDto) {
    return this.paymentService.initiatePayment(dto);
  }

  @Post('webhook')
  webhook(@Body() body: any) {
    return this.paymentService.handleWebhook(body);
  }

  // Mock only — simulates winner paying
  @Get('mock-pay/:paymentRef')
  mockPay(@Param('paymentRef') paymentRef: string) {
    return this.paymentService.mockPay(paymentRef);
  }

  @Get('status/:paymentRef')
  status(@Param('paymentRef') paymentRef: string) {
    return this.paymentService.getPaymentStatus(paymentRef);
  }
}
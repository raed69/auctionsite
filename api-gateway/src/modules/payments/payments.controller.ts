import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { proxyRequest } from '../../common/proxy.util';

@Controller('payments')
export class PaymentsController {
  private readonly paymentServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL')!;
  }

  /** POST /payments/initiate */
  @Post('initiate')
  @HttpCode(HttpStatus.CREATED)
  initiate(@Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.paymentServiceUrl,
      path: '/payments/initiate',
      method: 'POST',
      req,
      body,
    });
  }

  /** POST /payments/webhook — public, called by Konnect */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  webhook(@Body() body: any, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.paymentServiceUrl,
      path: '/payments/webhook',
      method: 'POST',
      req,
      body,
    });
  }

  /** GET /payments/mock-pay/:paymentRef — dev only */
  @Get('mock-pay/:paymentRef')
  mockPay(@Param('paymentRef') paymentRef: string, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.paymentServiceUrl,
      path: `/payments/mock-pay/${paymentRef}`,
      method: 'GET',
      req,
    });
  }

  /** GET /payments/status/:paymentRef */
  @Get('status/:paymentRef')
  status(@Param('paymentRef') paymentRef: string, @Req() req: Request) {
    return proxyRequest({
      serviceUrl: this.paymentServiceUrl,
      path: `/payments/status/${paymentRef}`,
      method: 'GET',
      req,
    });
  }
}

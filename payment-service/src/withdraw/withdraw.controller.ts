import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { InitiateWithdrawDto } from './dto/initiate-withdraw.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments/withdraw')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  // ─── Seller ──────────────────────────────────────────────────────────
  @Post('initiate')
  @UseGuards(JwtAuthGuard)
  async initiateWithdraw(
    @Body() dto: InitiateWithdrawDto,
    @Request() req: any,
  ) {
    return this.withdrawService.initiateWithdraw(dto, req.user.id);
  }

  @Get('status/:ref')
  @UseGuards(JwtAuthGuard)
  async getStatus(@Param('ref') ref: string) {
    return this.withdrawService.getWithdrawStatus(ref);
  }

  // ─── Admin ───────────────────────────────────────────────────────────
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  async getAllWithdrawals() {
    return this.withdrawService.getAllWithdrawals();
  }

  @Patch('admin/complete/:ref')
  @UseGuards(JwtAuthGuard)
  async completeWithdraw(@Param('ref') ref: string) {
    return this.withdrawService.completeWithdraw(ref);
  }
}
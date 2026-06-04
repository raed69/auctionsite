import { IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InitiateWithdrawDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  amount: number;
}
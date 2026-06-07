import { IsOptional, IsString } from 'class-validator';
import { IsId } from '../../common/is-id.decorator';

/** Emitted by user-service when an admin approves or rejects a seller request. */
export class SellerDecisionDto {
  @IsId()
  userId!: string;

  /** Optional reason shown to the applicant (mostly for rejections). */
  @IsOptional()
  @IsString()
  reason?: string;
}
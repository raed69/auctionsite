import { IsString, IsNotEmpty } from 'class-validator';

export class SendTransactionDto {
  /** base64 transaction already signed by the user's wallet. */
  @IsString()
  @IsNotEmpty()
  signedTransaction: string;
}

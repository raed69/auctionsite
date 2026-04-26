import { IsString, IsNotEmpty } from 'class-validator';

export class ConnectWalletDto {
  @IsString()
  @IsNotEmpty()
  phantom_wallet_address: string;
}

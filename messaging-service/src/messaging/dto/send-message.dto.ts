import { IsString, IsNotEmpty, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  @IsNotEmpty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  // Optional: tie a message to an auction (e.g. buyer asking seller about an item)
  @IsUUID()
  @IsOptional()
  auctionId?: string;
}

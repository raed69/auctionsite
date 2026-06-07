import { IsId } from '../../common/is-id.decorator';

/** Emitted by user-service after a successful registration. */
export class WelcomeDto {
  @IsId()
  userId: string;
}

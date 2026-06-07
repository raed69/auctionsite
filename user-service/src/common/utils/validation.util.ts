import { BadRequestException } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';

/**
 * Asserts that the given string is a valid Solana (Phantom) wallet address.
 *
 * @param address - the base58 wallet address to validate
 * @throws BadRequestException if the address is not a valid Solana public key
 */
export function assertValidSolanaAddress(address: string): void {
  try {
    new PublicKey(address);
  } catch {
    throw new BadRequestException('Invalid Solana wallet address');
  }
}

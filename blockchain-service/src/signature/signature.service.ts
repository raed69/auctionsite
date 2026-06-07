import { BadRequestException, Injectable } from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import * as nacl from 'tweetnacl';
import bs58 from 'bs58';

/** Supported encodings for the signature bytes sent by the wallet. */
export type SignatureEncoding = 'base58' | 'base64';

@Injectable()
export class SignatureService {
  /**
   * Verifies an ed25519 signature produced by a Phantom wallet's `signMessage`,
   * proving the caller controls the wallet's private key.
   *
   * @param walletAddress - the base58 Solana public key claiming ownership
   * @param message - the exact UTF-8 message that was signed
   * @param signature - the signature bytes, encoded per `encoding`
   * @param encoding - encoding of `signature` (default `base58`)
   * @returns whether the signature is valid for the given wallet and message
   * @throws BadRequestException if the wallet address or signature is malformed
   */
  verifyWalletSignature(
    walletAddress: string,
    message: string,
    signature: string,
    encoding: SignatureEncoding = 'base58',
  ): boolean {
    let publicKeyBytes: Uint8Array;
    try {
      publicKeyBytes = new PublicKey(walletAddress).toBytes();
    } catch {
      throw new BadRequestException('Invalid Solana wallet address');
    }

    let signatureBytes: Uint8Array;
    try {
      signatureBytes =
        encoding === 'base64'
          ? new Uint8Array(Buffer.from(signature, 'base64'))
          : bs58.decode(signature);
    } catch {
      throw new BadRequestException('Invalid signature encoding');
    }

    if (signatureBytes.length !== nacl.sign.signatureLength) {
      throw new BadRequestException('Invalid signature length');
    }

    const messageBytes = new TextEncoder().encode(message);
    return nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes,
    );
  }
}

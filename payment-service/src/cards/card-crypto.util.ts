import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/** An encrypted value plus the IV and auth tag needed to decrypt it. */
export interface EncryptedField {
  ciphertext: string;
  iv: string;
  tag: string;
}

function getKey(): Buffer {
  const hex = process.env.CARD_ENCRYPTION_KEY;
  if (!hex) {
    throw new Error('CARD_ENCRYPTION_KEY is not set');
  }
  const key = Buffer.from(hex, 'hex');
  if (key.length !== 32) {
    throw new Error('CARD_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
  }
  return key;
}

/**
 * Encrypts a sensitive value (e.g. a gateway payment-method token) with
 * AES-256-GCM. A fresh random IV is used per call.
 */
export function encrypt(plaintext: string): EncryptedField {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
  };
}

/**
 * Decrypts a value produced by {@link encrypt}. Throws if the data has been
 * tampered with (GCM auth-tag check).
 */
export function decrypt(field: EncryptedField): string {
  const decipher = createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(field.iv, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(field.tag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(field.ciphertext, 'base64')),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
}

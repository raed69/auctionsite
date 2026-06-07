"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = require("crypto");
const ALGORITHM = 'aes-256-gcm';
function getKey() {
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
function encrypt(plaintext) {
    const iv = (0, crypto_1.randomBytes)(12);
    const cipher = (0, crypto_1.createCipheriv)(ALGORITHM, getKey(), iv);
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
function decrypt(field) {
    const decipher = (0, crypto_1.createDecipheriv)(ALGORITHM, getKey(), Buffer.from(field.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(field.tag, 'base64'));
    const plaintext = Buffer.concat([
        decipher.update(Buffer.from(field.ciphertext, 'base64')),
        decipher.final(),
    ]);
    return plaintext.toString('utf8');
}
//# sourceMappingURL=card-crypto.util.js.map
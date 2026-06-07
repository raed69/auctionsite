export interface EncryptedField {
    ciphertext: string;
    iv: string;
    tag: string;
}
export declare function encrypt(plaintext: string): EncryptedField;
export declare function decrypt(field: EncryptedField): string;

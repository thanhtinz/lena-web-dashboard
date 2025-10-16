import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.SESSION_SECRET || '';

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY or SESSION_SECRET must be configured for token encryption');
}

/**
 * Encrypt sensitive data (like bot tokens)
 */
export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('Encryption key not configured');
  }
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

/**
 * Decrypt sensitive data
 */
export function decrypt(ciphertext: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('Encryption key not configured');
  }
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

import crypto from 'crypto';

/**
 * Generate a secure API key for bot processes
 * Format: bot_<random_32_chars>
 */
export function generateBotApiKey(): string {
  const randomBytes = crypto.randomBytes(24);
  return `bot_${randomBytes.toString('hex')}`;
}

/**
 * Verify bot API key format
 */
export function isValidBotApiKey(key: string): boolean {
  return /^bot_[a-f0-9]{48}$/.test(key);
}

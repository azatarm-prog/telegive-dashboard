import { Account } from '../types/auth';

/**
 * Get the bot_id for Channel Service API calls
 * Uses bot_id if available, falls back to id for backward compatibility
 */
export function getBotIdFromAccount(account: Account | null): number | null {
  if (!account) return null;
  
  // Prefer bot_id if available (new format)
  if (account.bot_id) {
    return account.bot_id;
  }
  
  // Fallback to id (for backward compatibility)
  return account.id;
}

/**
 * Check if account has valid bot_id for Channel Service
 */
export function hasValidBotId(account: Account | null): boolean {
  const botId = getBotIdFromAccount(account);
  return botId !== null && botId > 0;
}


import type { AppId } from './app-contracts';

/**
 * Strips legacy "Tin nhắn: " prefix from display names.
 */
export function cleanDisplayName(name: string): string {
  if (!name) return '';
  return name.replace(/^Tin nhắn:\s*/i, '').trim();
}

/**
 * Legacy person tags carry no record id; map the visible contact name to its Zola thread.
 * Level 1: "Khoa BE" is the alias of the culprit, "Anh Tuấn Thợ Điện" is a real (innocent) electrician.
 */
const THREAD_BY_CONTACT_NAME: Record<string, string> = {
  'Khoa BE': 'thread_003',
  'Anh Tuấn Thợ Điện': 'thread_004',
};

/**
 * Resolves the conversation ID for any evidence or record ID.
 * Examples:
 * - thread_003_m4 -> thread_003
 * - thread_004 -> thread_004
 * - thread_007_m2 -> thread_007
 * - chat:shop_lingerie:message:1 -> shop_lingerie
 * - chat:shop_lingerie -> shop_lingerie
 */
export function resolveConversationId(
  sourceApp?: AppId,
  recordId?: string,
  conversationId?: string,
  displayName?: string,
): string | undefined {
  if (conversationId && conversationId.trim()) return conversationId.trim();
  if (!recordId) {
    if (sourceApp === 'internet-messaging' && displayName) {
      const clean = cleanDisplayName(displayName);
      return THREAD_BY_CONTACT_NAME[clean];
    }
    return undefined;
  }
  const id = recordId.trim();
  // Zola/messaging threads: thread_007_m4 -> thread_007
  if (id.startsWith('thread_')) {
    return id.replace(/_(?:m\d+|history|banner)$/, '');
  }
  // Ecommerce chats: chat:shop_lingerie:message:msg_1 -> shop_lingerie
  if (id.startsWith('chat:')) {
    const parts = id.split(':');
    if (parts.length >= 2) return parts[1];
  }
  return undefined;
}

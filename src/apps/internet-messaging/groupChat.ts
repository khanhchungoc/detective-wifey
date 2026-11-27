import type { MessagingContact, MessagingMessage, MessagingThread } from './types';

/**
 * Label shown for a group message sender. A saved contact appears under the
 * player's saved name (like real chat apps); otherwise the literal senderName.
 * Returns '' when the message carries no group sender info (old-style data).
 */
export function groupSenderLabel(message: MessagingMessage, contacts: MessagingContact[] = []): string {
  if (message.senderContactId) {
    const contact = contacts.find(entry => entry.id === message.senderContactId);
    if (contact?.name) return contact.name;
  }
  return message.senderName || '';
}

/** Inbox preview: groups prefix the last message with its sender label. */
export function threadPreview(thread: MessagingThread, contacts: MessagingContact[] = []): string {
  const last = thread.messages[thread.messages.length - 1];
  if (!thread.isGroup || !last) return thread.lastMessage;
  const label = last.sender === 'me' ? 'Bạn' : groupSenderLabel(last, contacts);
  return label ? `${label}: ${last.text || thread.lastMessage}` : thread.lastMessage;
}

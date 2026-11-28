import { record, records, text, textFields, number, optionalNumber } from '../../shared/data/read';
import type {
  MessagingDataContract,
  MessagingThread,
  MessagingMessage,
  MessagingCloudDocument,
} from './types';

const historyPriority = (value: unknown) =>
  value === 'high' || value === 'medium' || value === 'low' ? value : 'regular';

function message(data: Record<string, unknown>): MessagingMessage {
  const location = record(data.locationData);
  return {
    ...textFields(data, [
      'id',
      'text',
      'time',
      'clueRefId',
      'reaction',
      'imageAsset',
      'imageAlt',
    ] as const),
    sender: data.sender === 'me' ? 'me' : 'them',
    type:
      data.type === 'location' ? 'location' : data.type === 'image' ? 'image' : 'text',
    isRead: data.isRead === true,
    senderContactId: text(data.senderContactId) || undefined,
    senderName: text(data.senderName) || undefined,
    replyToId: text(data.replyToId) || undefined,
    locationData: data.locationData
      ? textFields(location, ['venueName', 'address', 'mapThumbnail'] as const)
      : undefined,
  };
}

function parseMessageTimestamp(raw: string): number {
  if (!raw) return 0;
  const fullMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (fullMatch) {
    const day = parseInt(fullMatch[1], 10);
    const month = parseInt(fullMatch[2], 10) - 1;
    const year = parseInt(fullMatch[3], 10);
    const hour = parseInt(fullMatch[4], 10);
    const min = parseInt(fullMatch[5], 10);
    return new Date(year, month, day, hour, min).getTime();
  }
  const shortMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/);
  if (shortMatch) {
    const day = parseInt(shortMatch[1], 10);
    const month = parseInt(shortMatch[2], 10) - 1;
    const hour = parseInt(shortMatch[3], 10);
    const min = parseInt(shortMatch[4], 10);
    return new Date(2026, month, day, hour, min).getTime();
  }
  const timeOnlyMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (timeOnlyMatch) {
    const hour = parseInt(timeOnlyMatch[1], 10);
    const min = parseInt(timeOnlyMatch[2], 10);
    return new Date(2026, 9, 15, hour, min).getTime();
  }
  const parsed = Date.parse(raw);
  return isNaN(parsed) ? 0 : parsed;
}

function thread(data: Record<string, unknown>): MessagingThread {
  const parsedMessages = records(data.messages).map(message);
  const sortedMessages = [...parsedMessages].sort((a, b) => {
    const timeA = parseMessageTimestamp(a.timestamp || a.time || '');
    const timeB = parseMessageTimestamp(b.timestamp || b.time || '');
    return timeA - timeB;
  });

  const latestMessage = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1] : undefined;
  const derivedLastMessage = latestMessage ? latestMessage.text : text(data.lastMessage);
  const derivedTimestamp = (latestMessage ? (latestMessage.timestamp || latestMessage.time) : undefined) || text(data.timestamp);

  return {
    historyPriority: historyPriority(data.historyPriority),
    threadId: text(data.threadId),
    contactName: text(data.contactName),
    avatarGradient: text(data.avatarGradient),
    avatarIndex: optionalNumber(data.avatarIndex),
    lastMessage: derivedLastMessage,
    timestamp: derivedTimestamp,
    suspectId: text(data.suspectId),
    realIdentity: text(data.realIdentity),
    systemBanner: text(data.systemBanner),
    unreadCount: number(data.unreadCount),
    isPinned: data.isPinned === true,
    isDisguised: data.isDisguised === true,
    isMuted: data.isMuted === true,
    isGroup: data.isGroup === true || undefined,
    memberCount: number(data.memberCount) || undefined,
    pinnedMessageId: text(data.pinnedMessageId) || undefined,
    messages: sortedMessages,
  };
}

function document(data: Record<string, unknown>): MessagingCloudDocument {
  const type = text(data.fileType);
  return {
    ...textFields(data, [
      'id',
      'fileName',
      'date',
      'fileSize',
      'description',
      'clueRefId',
      'suspectTag',
      'senderName',
      'senderAvatar',
      'time',
      'fullDate',
      'previewHeader',
      'previewTitle',
      'previewSubtitle',
      'previewSnippet',
      'textMessage',
      'imageUrl',
    ] as const),
    fileType:
      type === 'pdf' ||
      type === 'jpg' ||
      type === 'png' ||
      type === 'xlsx' ||
      type === 'doc' ||
      type === 'link'
        ? type
        : 'text',
  };
}

function sortThreads(list: MessagingThread[]): MessagingThread[] {
  return [...list].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    const timeA = parseMessageTimestamp(a.timestamp || '');
    const timeB = parseMessageTimestamp(b.timestamp || '');
    return timeB - timeA;
  });
}

export function readMessagingData(value: unknown): MessagingDataContract {
  const data = record(value);
  const discover = record(data.discoverData);
  return {
    currentUser: data.currentUser
      ? textFields(data.currentUser, ['name', 'handle', 'avatarInitials', 'statusText'] as const)
      : undefined,
    threads: sortThreads(records(data.threads).map(thread)),
    otherThreads: sortThreads(records(data.otherThreads).map(thread)),
    contacts: records(data.contacts).map((contact) => ({
      historyPriority: historyPriority(contact.historyPriority),
      ...textFields(contact, [
        'id',
        'name',
        'phone',
        'department',
        'note',
        'avatarGradient',
        'section',
        'suspectName',
      ] as const),
      isBlocked: contact.isBlocked === true,
      avatarIndex: optionalNumber(contact.avatarIndex),
    })),
    cloudDocuments: records(data.cloudDocuments).map(document),
    timelinePosts: Array.isArray(data.timelinePosts)
      ? records(data.timelinePosts).map((post) => ({
          ...textFields(post, [
            'id',
            'author',
            'avatarGradient',
            'avatarInitials',
            'timestamp',
            'content',
            'suspectTag',
          ] as const),
          likesCount: number(post.likesCount),
          commentsCount: number(post.commentsCount),
        }))
      : undefined,
    discoverData: data.discoverData
      ? {
          promoBanner: discover.promoBanner
            ? textFields(discover.promoBanner, ['tag', 'badge', 'title', 'subtitle'] as const)
            : undefined,
          miniApps: Array.isArray(discover.miniApps)
            ? records(discover.miniApps).map((row) =>
                textFields(row, ['id', 'name', 'icon', 'color'] as const)
              )
            : undefined,
          officialAccounts: Array.isArray(discover.officialAccounts)
            ? records(discover.officialAccounts).map((row) =>
                textFields(row, ['id', 'name', 'category', 'badge', 'color'] as const)
              )
            : undefined,
        }
      : undefined,
  };
}

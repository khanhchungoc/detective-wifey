export type HistoryPriority = 'high' | 'medium' | 'regular' | 'low';

export interface MessagingMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time?: string;
  timestamp?: string;
  type?: 'text' | 'location' | 'image';
  imageAsset?: string;
  imageAlt?: string;
  isRead?: boolean;
  clueRefId?: string;
  reaction?: string;
  /** Group threads: sender resolved to the saved contact name (MessagingContact.id). */
  senderContactId?: string;
  /** Group threads: literal sender label when the sender is not a saved contact. */
  senderName?: string;
  /** Group threads: id of the message this one replies to. */
  replyToId?: string;
  locationData?: {
    venueName: string;
    address: string;
    mapThumbnail?: string;
  };
}

export interface MessagingThread {
  historyPriority?: HistoryPriority;
  threadId: string;
  contactName: string;
  /** Photo slot in the avatar sheet, resolved from the level contact. */
  avatarIndex?: number;
  avatarGradient?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isPinned?: boolean;
  isDisguised?: boolean;
  isMuted?: boolean;
  suspectId?: string;
  realIdentity?: string;
  systemBanner?: string;
  /** Group thread flag; group messages carry senderContactId or senderName. */
  isGroup?: boolean;
  memberCount?: number;
  /** Id of a message in `messages` shown as the pinned banner. */
  pinnedMessageId?: string;
  messages: MessagingMessage[];
}

export interface MessagingContact {
  historyPriority?: HistoryPriority;
  id: string;
  name: string;
  phone?: string;
  department?: string;
  note?: string;
  isBlocked?: boolean;
  avatarGradient?: string;
  avatarIndex?: number;
  section: string;
  suspectName?: string;
}

export interface MessagingCloudDocument {
  id: string;
  fileName: string;
  date: string;
  fileSize: string;
  description: string;
  fileType: 'pdf' | 'jpg' | 'png' | 'xlsx' | 'doc' | 'text' | 'link';
  clueRefId?: string;
  suspectTag?: string;
  senderName?: string;
  senderAvatar?: string;
  time?: string;
  fullDate?: string;
  previewHeader?: string;
  previewTitle?: string;
  previewSubtitle?: string;
  previewSnippet?: string;
  textMessage?: string;
  imageUrl?: string;
}

export interface MessagingTimelinePost {
  id: string;
  author: string;
  avatarGradient?: string;
  avatarInitials?: string;
  timestamp: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  suspectTag?: string;
}

export interface MessagingDiscoverData {
  promoBanner?: {
    tag: string;
    badge: string;
    title: string;
    subtitle: string;
  };
  miniApps?: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
  }>;
  officialAccounts?: Array<{
    id: string;
    name: string;
    category: string;
    badge: string;
    color?: string;
  }>;
}

export interface MessagingDataContract {
  currentUser?: {
    name: string;
    handle: string;
    avatarInitials?: string;
    statusText?: string;
  };
  threads?: MessagingThread[];
  otherThreads?: MessagingThread[];
  contacts?: MessagingContact[];
  cloudDocuments?: MessagingCloudDocument[];
  timelinePosts?: MessagingTimelinePost[];
  discoverData?: MessagingDiscoverData;
}

// Backward-compatible aliases
export type ZolaMessage = MessagingMessage;
export type ZolaThread = MessagingThread;
export type ZolaContact = MessagingContact;
export type ZolaCloudDocument = MessagingCloudDocument;
export type ZolaTimelinePost = MessagingTimelinePost;
export type ZolaDiscoverData = MessagingDiscoverData;
export type ZolaDataContract = MessagingDataContract;

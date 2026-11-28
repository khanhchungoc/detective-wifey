export interface EvidenceReference {
  suspectName?: string;
  suspectId?: string;
  clueRefId?: string;
}

export interface EcommerceItem {
  productId?: string;
  keywords?: string[];
  artwork?: string;
  discount?: string;
  rating?: string;
  sold?: string;
  location?: string;
  productTitle?: string;
  variantName?: string;
  price?: string | number;
  quantity?: number;
  thumbnailUrl?: string;
}

export const ecommerceProfileQueueIds = [
  'awaiting_confirmation',
  'awaiting_pickup',
  'awaiting_delivery',
  'awaiting_review',
  'mobile_topup',
  'express_delivery',
] as const;

export type EcommerceProfileQueue = (typeof ecommerceProfileQueueIds)[number];

export interface EcommerceOrder extends EvidenceReference {
  orderId: string;
  /** Player-facing order code. `orderId` stays the internal key. */
  displayCode?: string;
  shopName?: string;
  isFavorite?: boolean;
  status?: string;
  profileQueues?: EcommerceProfileQueue[];
  orderDate?: string;
  recipientName?: string;
  recipientPhone?: string;
  shippingAddress?: string;
  items: EcommerceItem[];
  totalAmount?: string | number;
  paymentMethod?: string;
  trackingNumber?: string;
  courier?: string;
}

export interface EcommerceSearch extends EvidenceReference {
  id: string;
  text: string;
}

export interface EcommerceMessage extends EvidenceReference {
  id: string;
  sender: 'shop' | 'user';
  text: string;
  time?: string;
  date?: string;
  isAutoReply?: boolean;
  isUnread?: boolean;
}

export interface EcommerceChat extends EvidenceReference {
  shopId: string;
  shopName: string;
  logo?: string;
  logoStyle?: string;
  isFavorite?: boolean;
  isActive?: boolean;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  date?: string;
  pinnedProduct?: {
    title?: string;
    variant?: string;
    price?: string | number;
    discount?: string;
    salesCount?: string;
    artwork?: string;
    thumbnailUrl?: string;
  };
  messages: EcommerceMessage[];
}

export type NotificationType = 'order' | 'seller' | 'promo' | 'security';

export interface EcommerceNotification extends EvidenceReference {
  id: string;
  type: NotificationType;
  title: string;
  snippet?: string;
  timestamp?: string;
  trackingId?: string;
  orderId?: string;
  isPinned?: boolean;
}

export interface EcommerceProfile {
  username?: string;
  membership?: string;
  following?: number;
  followers?: number;
  savings?: string | number;
  walletBalance?: string | number;
  coins?: number;
  voucherCount?: number;
}

export interface EcommerceData {
  browsingPatterns: string[];
  unreadBadge?: number;
  cartCount?: number;
  chatUnreadCount?: number;
  profile?: EcommerceProfile;
  products: EcommerceItem[];
  recentSearches: EcommerceSearch[];
  popularSearches: string[];
  orders: EcommerceOrder[];
  chats: EcommerceChat[];
  notifications: EcommerceNotification[];
}

export type OrderFilter = 'all' | 'in_transit' | 'completed' | 'cancelled' | EcommerceProfileQueue;
export type NotificationFilter = 'all' | NotificationType;
export type EcommerceTab = 'home' | 'notifications' | 'profile';
export type EcommerceView =
  | { screen: EcommerceTab }
  | { screen: 'orders' }
  | { screen: 'search' }
  | { screen: 'inbox' }
  | { screen: 'thread'; shopId: string };

// Backward-compatible aliases
export type PosheeItem = EcommerceItem;
export type PosheeOrder = EcommerceOrder;
export type PosheeSearch = EcommerceSearch;
export type PosheeMessage = EcommerceMessage;
export type PosheeChat = EcommerceChat;
export type PosheeNotification = EcommerceNotification;
export type PosheeProfile = EcommerceProfile;
export type PosheeData = EcommerceData;
export type PosheeTab = EcommerceTab;
export type PosheeView = EcommerceView;

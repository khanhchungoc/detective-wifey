import type {
  EvidenceReference,
  EcommerceChat,
  EcommerceData,
  EcommerceItem,
  EcommerceNotification,
  EcommerceOrder,
  EcommerceProfileQueue,
  EcommerceView,
  OrderFilter,
  NotificationFilter,
} from './types';
import { ecommerceProfileQueueIds } from './types';
import { productArtworkForTitle } from './productArtworks';

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as RecordValue)
    : {};
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const text = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;
const number = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;
const amount = (value: unknown) => number(value) ?? text(value);
const bool = (value: unknown): boolean | undefined =>
  typeof value === 'boolean' ? value : undefined;
const strings = (value: unknown): string[] =>
  list(value).filter((v): v is string => typeof v === 'string');
const profileQueues = (value: unknown): EcommerceProfileQueue[] =>
  list(value).flatMap((queue) =>
    typeof queue === 'string' && ecommerceProfileQueueIds.includes(queue as EcommerceProfileQueue)
      ? [queue as EcommerceProfileQueue]
      : []
  );
const refs = (value: RecordValue): EvidenceReference => ({
  suspectName: text(value.suspectName),
  suspectId: text(value.suspectId),
  clueRefId: text(value.clueRefId),
});
const item = (value: unknown): EcommerceItem => {
  const r = record(value);
  const productTitle = text(r.productTitle);
  return {
    productId: text(r.productId),
    keywords: strings(r.keywords),
    artwork: text(r.artwork) ?? productArtworkForTitle(productTitle),
    discount: text(r.discount),
    rating: text(r.rating),
    sold: text(r.sold),
    location: text(r.location),
    productTitle,
    variantName: text(r.variantName),
    price: amount(r.price),
    quantity: number(r.quantity),
    thumbnailUrl: text(r.thumbnailUrl),
  };
};

/** Preserve supplied legacy fields and resolve only explicitly mapped product artwork titles. */
export function normalizeEcommerceData(value: unknown): EcommerceData | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const r = record(value);
  const profile = record(r.profile);
  return {
    browsingPatterns: strings(r.browsingPatterns),
    unreadBadge: number(r.unreadBadge),
    cartCount: number(r.cartCount),
    chatUnreadCount: number(r.chatUnreadCount),
    profile: r.profile
      ? {
          username: text(profile.username),
          membership: text(profile.membership),
          following: number(profile.following),
          followers: number(profile.followers),
          savings: amount(profile.savings),
          walletBalance: amount(profile.walletBalance),
          coins: number(profile.coins),
          voucherCount: number(profile.voucherCount),
        }
      : undefined,
    products: list(r.products).map(item),
    popularSearches: list(r.popularSearches).filter((v): v is string => typeof v === 'string'),
    recentSearches: list(r.recentSearches).flatMap((v, index) => {
      if (typeof v === 'string') return [{ id: `search-${index}`, text: v }];
      const s = record(v);
      return typeof s.text === 'string'
        ? [{ id: text(s.id) ?? `search-${index}`, text: s.text, ...refs(s) }]
        : [];
    }),
    orders: list(r.orders).flatMap((v) => {
      const o = record(v);
      if (typeof o.orderId !== 'string') return [];
      const status = text(o.status);
      return [
        {
          ...refs(o),
          orderId: o.orderId,
          displayCode: text(o.displayCode) ?? o.orderId,
          shopName: text(o.shopName),
          isFavorite: bool(o.isFavorite),
          profileQueues: profileQueues(o.profileQueues),
          status:
            status === 'Giao hàng thành công'
              ? 'completed'
              : status === 'Đang vận chuyển'
              ? 'in_transit'
              : status === 'Đã hủy'
              ? 'cancelled'
              : status,
          orderDate: text(o.orderDate),
          recipientName: text(o.recipientName) ?? text(o.recipient),
          recipientPhone: text(o.recipientPhone),
          shippingAddress: text(o.shippingAddress) ?? text(o.deliveryAddress),
          items: Array.isArray(o.items)
            ? o.items.map(item)
            : typeof o.title === 'string'
            ? [{
                productTitle: o.title,
                variantName: text(o.sku),
                price: amount(o.price),
                artwork: productArtworkForTitle(o.title),
              }]
            : [],
          totalAmount: amount(o.totalAmount),
          paymentMethod: text(o.paymentMethod),
          trackingNumber: text(o.trackingNumber),
          courier: text(o.courier),
        },
      ];
    }),
    chats: list(r.chats).flatMap((v) => {
      const c = record(v);
      if (typeof c.shopId !== 'string' || typeof c.shopName !== 'string') return [];
      const p = record(c.pinnedProduct);
      return [
        {
          ...refs(c),
          shopId: c.shopId,
          shopName: c.shopName,
          logo: text(c.logo),
          logoStyle: text(c.logoStyle),
          isFavorite: bool(c.isFavorite),
          isActive: bool(c.isActive),
          lastMessage: text(c.lastMessage),
          timestamp: text(c.timestamp),
          unreadCount: number(c.unreadCount),
          date: text(c.date),
          pinnedProduct: c.pinnedProduct
            ? {
                artwork: text(p.artwork) ?? productArtworkForTitle(text(p.title)),
                title: text(p.title),
                variant: text(p.variant),
                price: amount(p.price),
                discount: text(p.discount),
                salesCount: text(p.salesCount),
                thumbnailUrl: text(p.thumbnailUrl),
              }
            : undefined,
          messages: list(c.messages).flatMap((m) => {
            const message = record(m);
            return typeof message.id === 'string' &&
              typeof message.text === 'string' &&
              (message.sender === 'shop' || message.sender === 'user')
              ? [
                  {
                    ...refs(message),
                    id: message.id,
                    text: message.text,
                    sender: message.sender,
                    time: text(message.time),
                    date: text(message.date),
                    isAutoReply: bool(message.isAutoReply),
                    isUnread: bool(message.isUnread),
                  },
                ]
              : [];
          }),
        } satisfies EcommerceChat,
      ];
    }),
    notifications: list(r.notifications).flatMap((v) => {
      const n = record(v);
      if (
        typeof n.id !== 'string' ||
        typeof n.title !== 'string' ||
        !['order', 'seller', 'promo', 'security'].includes(String(n.type))
      )
        return [];
      return [
        {
          ...refs(n),
          id: n.id,
          title: n.title,
          type: n.type as EcommerceNotification['type'],
          snippet: text(n.snippet),
          timestamp: text(n.timestamp),
          trackingId: text(n.trackingId),
          orderId: text(n.orderId),
          isPinned: bool(n.isPinned),
        },
      ];
    }),
  };
}

export const normalizePosheeData = normalizeEcommerceData;

export const orderStatus = (status?: string) =>
  ({ completed: 'Đã giao', in_transit: 'Đang giao', cancelled: 'Đã hủy' })[status ?? ''] ??
  status ??
  '-';
const orderFilterOptions = [
  { id: 'all', title: 'Tất cả' },
  { id: 'in_transit', title: 'Đang giao' },
  { id: 'completed', title: 'Đã giao' },
  { id: 'cancelled', title: 'Đã hủy' },
  { id: 'awaiting_confirmation', title: 'Chờ xác nhận' },
  { id: 'awaiting_pickup', title: 'Chờ lấy hàng' },
  { id: 'awaiting_delivery', title: 'Chờ giao hàng' },
  { id: 'awaiting_review', title: 'Đánh giá' },
  { id: 'mobile_topup', title: 'Nạp điện thoại & Thẻ cào' },
  { id: 'express_delivery', title: 'Giao Hỏa Tốc' },
] as const satisfies ReadonlyArray<{ id: OrderFilter; title: string }>;
export const availableOrderFilters = (orders: EcommerceOrder[]) =>
  orderFilterOptions.filter(
    ({ id }) =>
      id === 'all' ||
      orders.length === 0 ||
      orders.some(
        (order) => order.status === id || order.profileQueues?.includes(id as EcommerceProfileQueue)
      )
  );
export const money = (value?: number | string) =>
  typeof value === 'number'
    ? `${new Intl.NumberFormat('vi-VN').format(value)} đ`
    : value ?? '-';
export const filterOrders = (orders: EcommerceOrder[], filter: OrderFilter) =>
  orders.filter(
    (order) =>
      filter === 'all' ||
      order.status === filter ||
      order.profileQueues?.includes(filter as EcommerceProfileQueue)
  );
export const filterNotifications = (
  rows: EcommerceNotification[],
  filter: NotificationFilter
) => rows.filter((n) => filter === 'all' || n.type === filter);
export const linkedOrder = (
  notification: EcommerceNotification,
  orders: EcommerceOrder[]
) => (notification.orderId ? orders.find((o) => o.orderId === notification.orderId) : undefined);
export const popView = (stack: EcommerceView[]): EcommerceView[] =>
  stack.length > 1 ? stack.slice(0, -1) : stack;
/** Only inline image bytes are permitted: supplied remote/relative URLs cannot cause post-load requests. */
export const safeImage = (url?: string) =>
  url && /^data:image\/(png|jpeg|webp|gif);base64,[a-z\d+/=\s]+$/i.test(url) ? url : undefined;


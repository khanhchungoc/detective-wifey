import {
  IoChevronForward,
  IoCubeOutline,
  IoPricetagOutline,
  IoStorefrontOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import { StoryEvidenceTarget } from '../../../features/investigation';
import type { UniversalEvidenceItem } from '../../../features/investigation';
import type { NotificationFilter, EcommerceNotification, EcommerceOrder } from '../types';
import { filterNotifications, linkedOrder } from '../ecommerceData';
import { ecommerceEvidence } from '../ecommerceEvidence';
import { EmptyState } from './EcommerceChrome';

const categoryIcons = {
  order: IoCubeOutline,
  promo: IoPricetagOutline,
  seller: IoStorefrontOutline,
  security: IoShieldCheckmarkOutline,
};

export function EcommerceNotificationView({
  notifications,
  orders,
  filter,
  onFilter,
  onOpen,
  caseId,
  onEvidence,
}: {
  notifications: EcommerceNotification[];
  orders: EcommerceOrder[];
  filter: NotificationFilter;
  onFilter: (filter: NotificationFilter) => void;
  onOpen: (order: EcommerceOrder) => void;
  caseId: string;
  onEvidence: (item: UniversalEvidenceItem) => void;
}) {
  const visible = filterNotifications(notifications, filter);
  const renderRow = (n: EcommerceNotification) => {
    const order = linkedOrder(n, orders);
    const Icon = categoryIcons[n.type];
    const content = (
      <>
        <Icon className="ecommerce-notification-icon" aria-hidden="true" />
        <div className="ecommerce-notification-body">
          <strong>{n.title}</strong>
          <p className="ecommerce-meta">{n.timestamp ?? '-'}</p>
          <p>{n.snippet ?? '-'}</p>
          {(n.orderId || n.trackingId) && (
            <p className="ecommerce-meta">
              {[
                n.orderId && `Đơn hàng: ${order?.displayCode ?? n.orderId}`,
                n.trackingId && `Mã vận đơn: ${n.trackingId}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}
        </div>
        {order && <IoChevronForward className="ecommerce-notification-link" aria-hidden="true" />}
      </>
    );
    return (
      <StoryEvidenceTarget
        key={n.id}
        item={ecommerceEvidence(
          caseId,
          `notification:${n.id}`,
          n.title,
          [n.snippet, order?.displayCode ?? n.orderId, n.trackingId].filter(Boolean).join('\n'),
          n,
          n.timestamp,
        )}
        onTriggerEvidence={onEvidence}
      >
        {order ? (
          <button
            type="button"
            className="ecommerce-card ecommerce-notification"
            onClick={() => onOpen(order)}
            aria-label={`Xem đơn ${order.displayCode ?? order.orderId}`}
          >
            {content}
          </button>
        ) : (
          <article className="ecommerce-card ecommerce-notification">{content}</article>
        )}
      </StoryEvidenceTarget>
    );
  };
  return (
    <>
      <div className="ecommerce-filters" aria-label="Loại thông báo">
        {(
          [
            { id: 'all', title: 'Tất cả' },
            { id: 'order', title: 'Đơn hàng' },
          ] as const
        ).map((f) => (
          <button
            type="button"
            key={f.id}
            aria-pressed={filter === f.id}
            onClick={() => onFilter(f.id)}
          >
            {f.title}
          </button>
        ))}
      </div>
      {!visible.length && (
        <EmptyState>
          {notifications.length ? 'Không có thông báo phù hợp.' : 'Chưa có thông báo.'}
        </EmptyState>
      )}
      {visible.map(renderRow)}
    </>
  );
}

export const PosheeNotificationView = EcommerceNotificationView;

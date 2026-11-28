import { useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import { StoryEvidenceTarget } from '../../../features/investigation';
import type { UniversalEvidenceItem } from '../../../features/investigation';
import { useSwipeBack } from '../../../shared/gestures/useSwipeBack';
import {
  SHEET_BACKDROP_OPEN_MS,
  SHEET_CLOSE_EASE,
  SHEET_CLOSE_MS,
  SHEET_OPEN_EASE,
  SHEET_OPEN_MS,
} from '../../../shared/motion/sheetMotion';
import { availableOrderFilters, filterOrders, money, orderStatus } from '../ecommerceData';
import { orderSnippet, ecommerceEvidence } from '../ecommerceEvidence';
import type { OrderFilter, EcommerceOrder } from '../types';
import { EmptyState, Thumbnail } from './EcommerceChrome';

interface EvidenceProps {
  caseId: string;
  onEvidence: (item: UniversalEvidenceItem) => void;
}

export function EcommerceOrderItems({ order }: { order: EcommerceOrder }) {
  return (
    <>
      {order.items.map((item, index) => (
        <div className="ecommerce-order-item" key={index}>
          <Thumbnail url={item.thumbnailUrl} artwork={item.artwork} />
          <div>
            <strong>{item.productTitle ?? '-'}</strong>
            <p>Phân loại hàng: {item.variantName ?? '-'}</p>
            <p>Số lượng: {item.quantity ?? '-'}</p>
            <p className="ecommerce-price">{money(item.price)}</p>
          </div>
        </div>
      ))}
    </>
  );
}

export const PosheeOrderItems = EcommerceOrderItems;

export function EcommerceOrderHistory({
  orders,
  filter,
  onFilter,
  onOpen,
  caseId,
  onEvidence,
}: EvidenceProps & {
  orders: EcommerceOrder[];
  filter: OrderFilter;
  onFilter: (filter: OrderFilter) => void;
  onOpen: (order: EcommerceOrder) => void;
}) {
  const visible = filterOrders(orders, filter);
  return (
    <>
      <div className="ecommerce-filters" aria-label="Trạng thái đơn mua">
        {availableOrderFilters(orders).map((f) => (
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
        <EmptyState>{orders.length ? 'Không có đơn phù hợp.' : 'Chưa có đơn mua.'}</EmptyState>
      )}
      {visible.map((order) => (
        <StoryEvidenceTarget
          key={order.orderId}
          item={ecommerceEvidence(
            caseId,
            order.orderId,
            order.recipientName ?? '-',
            orderSnippet(order),
            order,
            order.orderDate,
            'order',
          )}
          onTriggerEvidence={onEvidence}
        >
          <button
            type="button"
            className="ecommerce-card ecommerce-order"
            onClick={() => onOpen(order)}
            aria-label={`Xem đơn ${order.orderId}`}
          >
            <div className="ecommerce-row">
              <strong>
                {order.isFavorite && <span className="ecommerce-favorite">Yêu thích</span>}
                {order.shopName ?? order.orderId}
              </strong>
              <span className="ecommerce-order-status">{orderStatus(order.status)}</span>
            </div>
            <p className="ecommerce-meta">{order.orderDate ?? '-'}</p>
            <EcommerceOrderItems order={order} />
            <p>Người nhận: {order.recipientName ?? '-'}</p>
            <p>Địa chỉ: {order.shippingAddress ?? '-'}</p>
            <p>Số điện thoại: {order.recipientPhone ?? '-'}</p>
            <p>
              Thành tiền: <strong className="ecommerce-price">{money(order.totalAmount)}</strong>
            </p>
          </button>
        </StoryEvidenceTarget>
      ))}
    </>
  );
}

export const PosheeOrderHistory = EcommerceOrderHistory;

/** The existing project has no generic invoice drawer. Only the handle initiates drag-to-dismiss. */
export function EcommerceOrderDetailDrawer({
  order,
  caseId,
  onEvidence,
  onClose,
}: EvidenceProps & { order: EcommerceOrder; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const closingRef = useRef(false);
  const animsRef = useRef<Animation[]>([]);

  const cancelAnims = () => {
    for (const anim of animsRef.current) anim.cancel();
    animsRef.current = [];
  };

  const requestClose = () => {
    if (closingRef.current) return;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const reduced = typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    if (reduced || !panel || typeof panel.animate !== 'function') {
      onClose();
      return;
    }
    closingRef.current = true;
    cancelAnims();
    panel.style.pointerEvents = 'none';
    panel.style.transform = 'translate3d(0, 100%, 0)';
    const panelAnim = panel.animate(
      [{ transform: 'translate3d(0, 0, 0)' }, { transform: 'translate3d(0, 100%, 0)' }],
      { duration: SHEET_CLOSE_MS, easing: SHEET_CLOSE_EASE },
    );
    const anims: Animation[] = [panelAnim];
    if (backdrop && typeof backdrop.animate === 'function') {
      backdrop.style.opacity = '0';
      anims.push(backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: SHEET_CLOSE_MS, easing: SHEET_CLOSE_EASE }));
    }
    animsRef.current = anims;
    const finish = () => {
      closingRef.current = false;
      onClose();
    };
    void panelAnim.finished.then(finish, finish);
  };

  const swipe = useSwipeBack({ onBack: requestClose });

  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const reduced = typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    if (!reduced && panel && typeof panel.animate === 'function') {
      const anims: Animation[] = [
        panel.animate(
          [{ transform: 'translate3d(0, 100%, 0)' }, { transform: 'translate3d(0, 0, 0)' }],
          { duration: SHEET_OPEN_MS, easing: SHEET_OPEN_EASE },
        ),
      ];
      if (backdrop && typeof backdrop.animate === 'function') {
        anims.push(backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: SHEET_BACKDROP_OPEN_MS, easing: SHEET_OPEN_EASE }));
      }
      animsRef.current = anims;
    }
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    return () => {
      cancelAnims();
      previous?.focus();
    };
  }, []);

  return (
    <div ref={backdropRef} className="ecommerce-sheet-backdrop will-change-[opacity]" onClick={requestClose}>
      <section
        {...swipe}
        ref={panelRef}
        style={{ backfaceVisibility: 'hidden' }}
        className="ecommerce-sheet will-change-transform"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ecommerce-invoice-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            requestClose();
          }
          if (e.key === 'Tab') {
            e.preventDefault();
            closeRef.current?.focus();
          }
        }}
      >
        <div
          className="ecommerce-drag-handle"
          aria-hidden="true"
          onPointerDown={(e) => {
            drag.current = { x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
          onPointerUp={(e) => {
            const start = drag.current;
            drag.current = null;
            if (
              start &&
              e.clientY - start.y > 64 &&
              Math.abs(e.clientX - start.x) < (e.clientY - start.y) * 0.8
            )
              requestClose();
          }}
        >
          <span />
        </div>
        <div className="ecommerce-row ecommerce-sheet-header">
          <h2 id="ecommerce-invoice-title">Chi tiết đơn mua</h2>
          <button ref={closeRef} type="button" onClick={requestClose} aria-label="Đóng chi tiết đơn">
            <IoClose />
          </button>
        </div>
        <div className="ecommerce-sheet-body">
          <StoryEvidenceTarget
            item={ecommerceEvidence(
              caseId,
              order.orderId,
              order.recipientName ?? '-',
              orderSnippet(order),
              order,
              order.orderDate,
              'order',
            )}
            onTriggerEvidence={onEvidence}
          >
            <div className="ecommerce-card">
              <strong>{orderStatus(order.status)}</strong>
              <p>Mã đơn: {order.orderId}</p>
              <p>Ngày đặt: {order.orderDate ?? '-'}</p>
            </div>
            <section className="ecommerce-card">
              <h3>Thông tin vận chuyển</h3>
              <p>Đơn vị vận chuyển: {order.courier ?? '-'}</p>
              <p>Mã vận đơn: {order.trackingNumber ?? '-'}</p>
              <p>Người nhận: {order.recipientName ?? '-'}</p>
              <p>Địa chỉ: {order.shippingAddress ?? '-'}</p>
              <p>Số điện thoại: {order.recipientPhone ?? '-'}</p>
            </section>
            <section className="ecommerce-card">
              <EcommerceOrderItems order={order} />
              <p>
                Thành tiền: <strong className="ecommerce-price">{money(order.totalAmount)}</strong>
              </p>
              <p>Thanh toán: {order.paymentMethod ?? '-'}</p>
            </section>
          </StoryEvidenceTarget>
        </div>
      </section>
    </div>
  );
}

export const PosheeOrderDetailDrawer = EcommerceOrderDetailDrawer;

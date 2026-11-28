import { useMotionState } from '../../shared/motion/useMotionState';
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { IoBagHandle, IoSearchOutline, IoCameraOutline } from 'react-icons/io5';
import type { AppDefinition, VirtualAppProps } from '../../shared/contracts/app-contracts';
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';
import { UniversalEvidenceModal, type UniversalEvidenceItem } from '../../features/investigation';
import { popView } from './ecommerceData';
import { resolveEvidenceAttribution } from './ecommerceEvidence';
import type { NotificationFilter, OrderFilter, EcommerceOrder, EcommerceTab, EcommerceView } from './types';
import { EmptyState, DisabledControl, EcommerceHeader, EcommerceTabs, ShopAvatar, Thumbnail } from './components/EcommerceChrome';
import { EcommerceHomeView, EcommerceProfileView } from './components/EcommerceMarketplace';
import { EcommerceOrderDetailDrawer, EcommerceOrderHistory } from './components/EcommerceOrders';
import { EcommerceChatDetailView, EcommerceChatListView, EcommerceSearchOverlay } from './components/EcommerceMessages';
import { EcommerceNotificationView } from './components/EcommerceNotifications';
import './ecommerce.css';
import ecommerceIcon from './assets/ecommerce-icon.svg';
import { resolveMarketplaceData } from './marketplaceContent';
import { getAppBrand } from '../../shared/branding';

const BRAND = getAppBrand('ecommerce');
const DETAIL_EASE = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
const DETAIL_MS = 280;

const titles = {
  home: BRAND.brandName,
  notifications: 'Thông báo',
  profile: 'Tôi',
  orders: 'Đơn đã mua',
  search: 'Tìm kiếm',
  inbox: 'Chat',
  thread: 'Trò chuyện',
};

const isRootScreen = (screen: EcommerceView['screen']) =>
  screen === 'home' || screen === 'notifications' || screen === 'profile';

const isReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

export function EcommerceApp(props: VirtualAppProps) {
  return <EcommerceSession key={props.caseData.caseId} {...props} />;
}

/** Navigation/filter state is transient; narrative records remain immutable. */
function EcommerceSession({ caseData, onReturnHome, onTagSuspect }: VirtualAppProps) {
  const data = useMemo(
    () => resolveMarketplaceData(caseData.appsData?.ecommerce),
    [caseData]
  );
  const [stack, setStack] = useState<EcommerceView[]>([{ screen: 'home' }]);
  const [orderFilter, setOrderFilter] = useState<OrderFilter>('all');
  const [notificationFilter, setNotificationFilter] = useState<NotificationFilter>('all');
  const [activeChatsOnly, setActiveChatsOnly] = useState(false);
  const [selectedOrder, setSelectedOrder] = useMotionState<EcommerceOrder | null>(null, 'sheet');
  const [evidence, setEvidence] = useMotionState<UniversalEvidenceItem | null>(null, 'sheet');
  const scrollPositions = useRef(new Map<string, number>());
  const scrollArea = useRef<HTMLElement | null>(null);
  const detailLayerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const swipeProgressRef = useRef(0);
  const swipeDisplacementRef = useRef(0);
  const closingRef = useRef(false);
  const activeAnimsRef = useRef<Animation[]>([]);
  const prevDepthRef = useRef(1);

  const view = stack[stack.length - 1];
  const prevView = stack.length > 1 ? stack[stack.length - 2] : null;
  const viewKey = JSON.stringify(view);
  const evidenceShop = data?.chats.find(chat => chat.shopId === evidence?.conversationId);
  const evidenceProduct = (evidence?.kind ?? evidence?.source?.kind) === 'order'
    ? data?.orders.find(order => order.orderId === evidence?.source?.recordId)?.items[0]
    : undefined;

  const cancelActiveAnims = () => {
    for (const anim of activeAnimsRef.current) {
      anim.cancel();
    }
    activeAnimsRef.current = [];
  };

  useLayoutEffect(() => {
    if (scrollArea.current) {
      if (view.screen === 'thread' && !scrollPositions.current.has(viewKey)) {
        scrollArea.current.scrollTop = scrollArea.current.scrollHeight;
        const frameId = requestAnimationFrame(() => {
          if (scrollArea.current) {
            scrollArea.current.scrollTop = scrollArea.current.scrollHeight;
          }
        });
        return () => cancelAnimationFrame(frameId);
      } else {
        scrollArea.current.scrollTop = scrollPositions.current.get(viewKey) ?? 0;
      }
    }
  }, [viewKey, view.screen]);

  // Animate pushed sub-screens in on the GPU compositor (never black out underlying screen).
  useLayoutEffect(() => {
    const prevDepth = prevDepthRef.current;
    prevDepthRef.current = stack.length;
    if (stack.length <= 1) return;

    closingRef.current = false;
    swipeProgressRef.current = 0;
    swipeDisplacementRef.current = 0;
    cancelActiveAnims();

    const detailEl = detailLayerRef.current;
    const scrimEl = scrimRef.current;
    if (detailEl) {
      detailEl.style.pointerEvents = '';
      detailEl.style.transform = '';
    }
    if (scrimEl) scrimEl.style.opacity = '1';

    // Only play slide-in when pushing deeper, not when popping back to a lower sub-screen.
    if (stack.length <= prevDepth || isReducedMotion() || !detailEl || typeof detailEl.animate !== 'function') {
      return;
    }

    const anims: Animation[] = [
      detailEl.animate(
        [{ transform: 'translate3d(100%, 0, 0)' }, { transform: 'translate3d(0, 0, 0)' }],
        { duration: DETAIL_MS, easing: DETAIL_EASE },
      ),
    ];
    if (scrimEl && typeof scrimEl.animate === 'function') {
      anims.push(scrimEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DETAIL_MS, easing: DETAIL_EASE }));
    }
    activeAnimsRef.current = anims;
    return () => cancelActiveAnims();
  }, [stack.length, viewKey]);

  const saveScroll = () => {
    if (scrollArea.current) scrollPositions.current.set(JSON.stringify(view), scrollArea.current.scrollTop);
  };
  const push = (next: EcommerceView) => {
    saveScroll();
    swipeProgressRef.current = 0;
    swipeDisplacementRef.current = 0;
    setStack((s) => [...s, next]);
  };
  const openOrders = (filter: OrderFilter = 'all') => {
    setOrderFilter(filter);
    push({ screen: 'orders' });
  };

  const handleDetailSwipeProgress = (progress: number, displacement: number) => {
    if (activeAnimsRef.current.length > 0) {
      cancelActiveAnims();
    }
    swipeProgressRef.current = progress;
    swipeDisplacementRef.current = displacement;
    if (scrimRef.current) {
      scrimRef.current.style.opacity = String(Math.max(0, 1 - progress));
    }
  };

  const handleDetailSwipeEnd = (committed: boolean) => {
    if (committed) return;
    const fromOpacity = Math.max(0, 1 - swipeProgressRef.current);
    swipeProgressRef.current = 0;
    swipeDisplacementRef.current = 0;
    const scrimEl = scrimRef.current;
    if (!scrimEl) return;
    scrimEl.style.opacity = '1';
    if (!isReducedMotion() && typeof scrimEl.animate === 'function' && fromOpacity < 1) {
      scrimEl.animate([{ opacity: fromOpacity }, { opacity: 1 }], { duration: DETAIL_MS, easing: DETAIL_EASE });
    }
  };

  const closeDetail = () => {
    if (closingRef.current) return;
    const displacementPx = swipeDisplacementRef.current;
    const progress = swipeProgressRef.current;
    swipeProgressRef.current = 0;
    swipeDisplacementRef.current = 0;

    const detailEl = detailLayerRef.current;
    const scrimEl = scrimRef.current;
    if (isReducedMotion() || !detailEl || typeof detailEl.animate !== 'function') {
      saveScroll();
      setStack(popView);
      return;
    }

    closingRef.current = true;
    cancelActiveAnims();
    detailEl.style.pointerEvents = 'none';

    const innerSurface = detailEl.firstElementChild;
    if (innerSurface instanceof HTMLElement) {
      innerSurface.style.transform = '';
    }

    const duration = displacementPx > 0 ? Math.max(150, Math.round(DETAIL_MS * (1 - progress))) : DETAIL_MS;
    const fromTransform = displacementPx > 0 ? `translate3d(${displacementPx}px, 0, 0)` : 'translate3d(0, 0, 0)';
    detailEl.style.transform = 'translate3d(100%, 0, 0)';
    const detailAnim = detailEl.animate(
      [{ transform: fromTransform }, { transform: 'translate3d(100%, 0, 0)' }],
      { duration, easing: DETAIL_EASE },
    );
    const anims: Animation[] = [detailAnim];

    if (scrimEl && typeof scrimEl.animate === 'function') {
      const fromOpacity = Math.max(0, 1 - progress);
      scrimEl.style.opacity = '0';
      anims.push(scrimEl.animate([{ opacity: fromOpacity }, { opacity: 0 }], { duration, easing: DETAIL_EASE }));
    }
    activeAnimsRef.current = anims;

    const finish = () => {
      closingRef.current = false;
      saveScroll();
      setStack(popView);
    };
    void detailAnim.finished.then(finish, finish);
  };

  const back = () => {
    if (evidence) {
      setEvidence(null);
      return;
    }
    if (selectedOrder) {
      setSelectedOrder(null);
      return;
    }
    if (stack.length > 1) {
      closeDetail();
    } else onReturnHome();
  };

  const swipe = useSwipeBack({
    onBack: back,
    enabled: !evidence && !selectedOrder && stack.length > 1,
    onSwipeProgress: handleDetailSwipeProgress,
    onSwipeEnd: handleDetailSwipeEnd,
  });

  const selectTab = (tab: EcommerceTab) => {
    saveScroll();
    cancelActiveAnims();
    closingRef.current = false;
    setStack([{ screen: tab }]);
  };
  const evidenceProps = {
    caseId: caseData.caseId,
    onEvidence: (item: UniversalEvidenceItem) =>
      setEvidence(resolveEvidenceAttribution(item, caseData.suspectPool)),
  };

  const renderScreen = (targetView: EcommerceView, isTop: boolean) => {
    const root = isRootScreen(targetView.screen);
    const showTabs = root || targetView.screen === 'orders';
    const activeTab: EcommerceTab = targetView.screen === 'orders' ? 'profile' : (targetView.screen as EcommerceTab);
    const selectedChat = targetView.screen === 'thread' ? data?.chats.find((c) => c.shopId === targetView.shopId) : undefined;
    const key = JSON.stringify(targetView);

    return (
      <div
        {...(isTop && prevView ? swipe : {})}
        style={isTop && prevView ? { touchAction: 'pan-y', backfaceVisibility: 'hidden' } : undefined}
        className={`ecommerce-screen ecommerce-view-${targetView.screen} min-h-[44px] bg-[#F5F5F5] ${
          isTop && prevView ? 'h-full w-full shadow-2xl transform-gpu will-change-transform' : 'h-full w-full'
        }`}
        inert={!isTop || selectedOrder !== null || evidence !== null}
        aria-hidden={!isTop}
      >
        <EcommerceHeader
          title={titles[targetView.screen]}
          onBack={!root ? back : undefined}
          onChat={root ? () => push({ screen: 'inbox' }) : undefined}
          cartCount={data?.cartCount}
          chatCount={data?.chatUnreadCount}
        >
          {targetView.screen === 'home' ? (
            <div className="ecommerce-search-entry">
              <button type="button" onClick={() => push({ screen: 'search' })}>
                <IoSearchOutline />
                <span>{BRAND.searchPlaceholder ?? 'Tìm kiếm sản phẩm'}</span>
              </button>
              <DisabledControl label="Máy ảnh">
                <IoCameraOutline />
              </DisabledControl>
            </div>
          ) : undefined}
        </EcommerceHeader>
        <main key={key} ref={isTop ? scrollArea : undefined} className="ecommerce-content">
          {!data ? (
            <EmptyState>{BRAND.emptyStateMessage ?? `Chưa có dữ liệu ${BRAND.brandName} cho màn này.`}</EmptyState>
          ) : (
            <>
              {targetView.screen === 'home' && <EcommerceHomeView data={data} />}
              {targetView.screen === 'profile' && (
                <EcommerceProfileView data={data} onOrders={openOrders} />
              )}
              {targetView.screen === 'orders' && (
                <EcommerceOrderHistory
                  orders={data.orders}
                  filter={orderFilter}
                  onFilter={setOrderFilter}
                  onOpen={setSelectedOrder}
                  {...evidenceProps}
                />
              )}
              {targetView.screen === 'search' && <EcommerceSearchOverlay data={data} {...evidenceProps} />}
              {targetView.screen === 'inbox' && (
                <EcommerceChatListView
                  chats={data.chats}
                  activeOnly={activeChatsOnly}
                  onFilter={setActiveChatsOnly}
                  onOpen={(chat) => push({ screen: 'thread', shopId: chat.shopId })}
                  {...evidenceProps}
                />
              )}
              {selectedChat && <EcommerceChatDetailView chat={selectedChat} {...evidenceProps} />}
              {targetView.screen === 'notifications' && (
                <EcommerceNotificationView
                  notifications={data.notifications}
                  orders={data.orders}
                  filter={notificationFilter}
                  onFilter={setNotificationFilter}
                  onOpen={setSelectedOrder}
                  {...evidenceProps}
                />
              )}
            </>
          )}
        </main>
        {showTabs && (
          <EcommerceTabs
            active={activeTab}
            onSelect={selectTab}
            unread={data?.unreadBadge}
          />
        )}
      </div>
    );
  };

  return (
    <div
      className="ecommerce-app"
      style={{ '--ecommerce-brand': '#EE4D2D' } as CSSProperties}
    >
      {/* Base Layer: always mounted so pushed screens slide over real app content (never black or white void). */}
      <div
        style={{ backfaceVisibility: 'hidden' }}
        className="absolute inset-0 z-10 flex flex-col min-h-0 overflow-hidden transform-gpu"
      >
        {renderScreen(prevView ?? view, !prevView)}
        {prevView && (
          <div
            ref={scrimRef}
            aria-hidden="true"
            className="absolute inset-0 bg-black/35 z-10 pointer-events-none will-change-[opacity]"
          />
        )}
      </div>

      {/* Top Pushed Layer: compositor-thread WAAPI slide + live swipe-back revealing base layer underneath. */}
      {prevView && (
        <div
          ref={detailLayerRef}
          key={viewKey}
          style={{ backfaceVisibility: 'hidden' }}
          className="absolute inset-0 z-20 will-change-transform"
        >
          {renderScreen(view, true)}
        </div>
      )}

      {selectedOrder && (
        <div style={{ display: 'contents' }} inert={evidence !== null}>
          <EcommerceOrderDetailDrawer
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            {...evidenceProps}
          />
        </div>
      )}
      {evidence && (
        <UniversalEvidenceModal
          isOpen
          item={evidence}
          avatar={evidenceProduct
            ? <Thumbnail url={evidenceProduct.thumbnailUrl} artwork={evidenceProduct.artwork} />
            : evidenceShop ? <ShopAvatar shopId={evidenceShop.shopId} logo={evidenceShop.logo} style={evidenceShop.logoStyle} /> : undefined}
          onClose={() => setEvidence(null)}
          onPinEvidence={(suspect) => {
            if (suspect.trim()) onTagSuspect(suspect, 'ecommerce', evidence.source);
          }}
        />
      )}
    </div>
  );
}

export const appDefinition: AppDefinition = {
  dataKeys: ['ecommerce'],
  appId: 'ecommerce',
  displayName: BRAND.brandName,
  icon: IoBagHandle,
  iconAsset: ecommerceIcon,
  themeGradient: 'from-orange-500 to-amber-600',
  themeColor: '#EE4D2D',
  bottomBarColor: '#FFFFFF',
  notificationBadgeCount: 0,
  isLocked: false,
  component: EcommerceApp,
};

export default EcommerceApp;

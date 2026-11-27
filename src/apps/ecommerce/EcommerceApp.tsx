import { useMotionState } from '../../shared/motion/useMotionState';
import { useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react';
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

const titles = {
  home: BRAND.brandName,
  notifications: 'Thông báo',
  profile: 'Tôi',
  orders: 'Đơn đã mua',
  search: 'Tìm kiếm',
  inbox: 'Chat',
  thread: 'Trò chuyện',
};

export function EcommerceApp(props: VirtualAppProps) {
  return <EcommerceSession key={props.caseData.caseId} {...props} />;
}

/** Navigation/filter state is transient; narrative records remain immutable. */
function EcommerceSession({ caseData, onReturnHome, onTagSuspect }: VirtualAppProps) {
  const data = useMemo(
    () => resolveMarketplaceData(caseData.appsData?.ecommerce),
    [caseData]
  );
  const [stack, setStack] = useMotionState<EcommerceView[]>([{ screen: 'home' }], 'navigation');
  const [orderFilter, setOrderFilter] = useMotionState<OrderFilter>('all', 'fade');
  const [notificationFilter, setNotificationFilter] = useMotionState<NotificationFilter>('all', 'fade');
  const [activeChatsOnly, setActiveChatsOnly] = useMotionState(false, 'fade');
  const [selectedOrder, setSelectedOrder] = useMotionState<EcommerceOrder | null>(null, 'sheet');
  const [evidence, setEvidence] = useMotionState<UniversalEvidenceItem | null>(null, 'sheet');
  const scrollPositions = useRef(new Map<string, number>());
  const scrollArea = useRef<HTMLElement | null>(null);
  const view = stack[stack.length - 1];
  const viewKey = JSON.stringify(view);
  const evidenceShop = data?.chats.find(chat => chat.shopId === evidence?.conversationId);
  const evidenceProduct = (evidence?.kind ?? evidence?.source?.kind) === 'order'
    ? data?.orders.find(order => order.orderId === evidence?.source?.recordId)?.items[0]
    : undefined;

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

  const saveScroll = () => {
    if (scrollArea.current) scrollPositions.current.set(JSON.stringify(view), scrollArea.current.scrollTop);
  };
  const push = (next: EcommerceView) => {
    saveScroll();
    setStack((s) => [...s, next]);
  };
  const openOrders = (filter: OrderFilter = 'all') => {
    setOrderFilter(filter);
    push({ screen: 'orders' });
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
      saveScroll();
      setStack(popView);
    } else onReturnHome();
  };
  const swipe = useSwipeBack({ onBack: back, enabled: !evidence && !selectedOrder });
  const selectTab = (tab: EcommerceTab) => {
    saveScroll();
    setStack([{ screen: tab }]);
  };
  const evidenceProps = {
    caseId: caseData.caseId,
    onEvidence: (item: UniversalEvidenceItem) =>
      setEvidence(resolveEvidenceAttribution(item, caseData.suspectPool)),
  };
  const root = view.screen === 'home' || view.screen === 'notifications' || view.screen === 'profile';
  const selectedChat = view.screen === 'thread' ? data?.chats.find((c) => c.shopId === view.shopId) : undefined;

  return (
    <div
      {...swipe}
      className={`ecommerce-app ecommerce-view-${view.screen}`}
      style={{ '--ecommerce-brand': '#EE4D2D' } as CSSProperties}
    >
      <div className="ecommerce-screen min-h-[44px]" inert={selectedOrder !== null || evidence !== null}>
        <EcommerceHeader
          title={titles[view.screen]}
          onBack={!root ? back : undefined}
          onChat={root ? () => push({ screen: 'inbox' }) : undefined}
          cartCount={data?.cartCount}
          chatCount={data?.chatUnreadCount}
        >
          {view.screen === 'home' ? (
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
        <main key={viewKey} ref={scrollArea} className="ecommerce-content">
          {!data ? (
            <EmptyState>{BRAND.emptyStateMessage ?? `Chưa có dữ liệu ${BRAND.brandName} cho màn này.`}</EmptyState>
          ) : (
            <>
              {view.screen === 'home' && <EcommerceHomeView data={data} />}
              {view.screen === 'profile' && (
                <EcommerceProfileView data={data} onOrders={openOrders} />
              )}
              {view.screen === 'orders' && (
                <EcommerceOrderHistory
                  orders={data.orders}
                  filter={orderFilter}
                  onFilter={setOrderFilter}
                  onOpen={setSelectedOrder}
                  {...evidenceProps}
                />
              )}
              {view.screen === 'search' && <EcommerceSearchOverlay data={data} {...evidenceProps} />}
              {view.screen === 'inbox' && (
                <EcommerceChatListView
                  chats={data.chats}
                  activeOnly={activeChatsOnly}
                  onFilter={setActiveChatsOnly}
                  onOpen={(chat) => push({ screen: 'thread', shopId: chat.shopId })}
                  {...evidenceProps}
                />
              )}
              {selectedChat && <EcommerceChatDetailView chat={selectedChat} {...evidenceProps} />}
              {view.screen === 'notifications' && (
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
        {root && (
          <EcommerceTabs
            active={view.screen as EcommerceTab}
            onSelect={selectTab}
            unread={data?.unreadBadge}
          />
        )}
      </div>
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

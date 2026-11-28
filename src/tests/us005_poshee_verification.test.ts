import { describe, expect, it } from 'vitest';
import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { normalizeEcommerceData, filterOrders, filterNotifications, linkedOrder, orderStatus, money, popView, safeImage } from '../apps/ecommerce/ecommerceData';
import { orderSnippet, ecommerceEvidence, resolveEvidenceAttribution } from '../apps/ecommerce/ecommerceEvidence';
import { EcommerceOrderHistory, EcommerceOrderItems } from '../apps/ecommerce/components/EcommerceOrders';
import { EcommerceChatListView, EcommerceChatDetailView, EcommerceSearchOverlay } from '../apps/ecommerce/components/EcommerceMessages';
import { EcommerceNotificationView } from '../apps/ecommerce/components/EcommerceNotifications';
import { EcommerceApp, appDefinition } from '../apps/ecommerce/EcommerceApp';
import type { EcommerceView } from '../apps/ecommerce/types';
import { loadCase } from '../features/case-runtime';
import { resolveMarketplaceData, recommendProducts } from '../apps/ecommerce/marketplaceContent';
import { getAppBrand, getAppDisplayName } from '../shared/branding';
import { StoryEvidenceTarget, type UniversalEvidenceItem } from '../features/investigation';

const fixture = () => normalizeEcommerceData({
  orders: ['completed', 'in_transit', 'cancelled'].map((status, i) => ({ orderId: `order-${i}`, status, recipientName: 'Người nhận trong hồ sơ', recipientPhone: '09***123', shippingAddress: 'Địa chỉ rất dài\nDòng tiếp theo', items: [{ productTitle: 'Sản phẩm được cấp', variantName: 'Size S / Đỏ', price: 125000 }], totalAmount: 125000, paymentMethod: 'Đã cung cấp', clueRefId: 'CLUE-POSH-01' })),
  recentSearches: ['Từ khóa thường', { id: 'search-clue', text: 'Từ khóa có định danh', clueRefId: 'CLUE-POSH-04', suspectId: 's1' }],
  chats: [{ shopId: 'shop', shopName: 'Cửa hàng trong hồ sơ', lastMessage: 'Xem trước được cấp', unreadCount: 2, messages: [{ id: 'm1', sender: 'user', text: 'Nội dung được cấp', time: '20:00', clueRefId: 'CLUE-POSH-05' }] }],
  notifications: ['order', 'seller', 'promo', 'security'].map((type, i) => ({ id: `notice-${i}`, type, title: `Thông báo ${i}`, snippet: 'Nội dung giao hàng đầy đủ', orderId: type === 'order' ? 'order-1' : undefined, trackingId: 'Mã được cấp', clueRefId: 'CLUE-POSH-06' })),
})!;
const noop = () => {};
const evidenceProps = { caseId: 'case-test', onEvidence: noop };
type EventProps = { children?: ReactNode; onClick?: () => void; disabled?: boolean; 'aria-label'?: string; 'aria-pressed'?: boolean; item?: UniversalEvidenceItem };
function elements(node: ReactNode): ReactElement<EventProps>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!isValidElement<EventProps>(node)) return [];
  return [node, ...elements(node.props.children)];
}

describe('US-005 Ecommerce read-only investigation', () => {
  it('rejects absent/malformed modules and tolerates optional arrays', () => {
    for (const value of [null, undefined, [], 'wrong']) expect(normalizeEcommerceData(value)).toBeNull();
    expect(normalizeEcommerceData({ orders: [null, {}], chats: [{}], notifications: [{}], recentSearches: [null, 42] })).toMatchObject({ orders: [], chats: [], notifications: [], recentSearches: [] });
  });
  it('filters canonical statuses including cancelled in All without mutation', () => {
    const data = fixture();
    const before = JSON.stringify(data);
    expect(filterOrders(data.orders, 'all')).toHaveLength(3);
    expect(filterOrders(data.orders, 'in_transit').map(o => o.orderId)).toEqual(['order-1']);
    expect(filterOrders(data.orders, 'completed').map(o => o.orderId)).toEqual(['order-0']);
    expect(orderStatus('cancelled')).toBe('Đã hủy');
    expect(JSON.stringify(data)).toBe(before);
  });
  it('preserves existing level order fields without inventing dates, quantity, totals or suspect', () => {
    const loaded = loadCase('case_01');
    const data = normalizeEcommerceData(loaded.appsData.ecommerce)!;
    const gift = data.orders.find(order => order.orderId === 'order_01')!;
    const bag = data.orders.find(order => order.orderId === 'order_bag')!;
    expect(gift.status).toBe('completed');
    expect(bag.status).toBe('in_transit');
    expect(gift.items[0].variantName).toBe('be, size S');
    expect(gift.recipientName).toBe('Nguyễn Thị Thu Hương');
    expect(gift.shippingAddress).toBe('Sảnh Technosoft, tầng 1, tòa Minh An, 28 Duy Tân, Hà Nội');
    expect(gift.recipientPhone).toBe('0988886677');
    expect(gift.totalAmount).toBe('489.000đ');
    expect(gift.items[0].quantity).toBe(1);
    expect(gift.clueRefId).toBe('CLUE-POSH-05');
    expect(bag.suspectName).toBe('Nguyễn Huy Thịnh');
    expect(bag.suspectId).toBe('husband_hoang');
    const legacy = normalizeEcommerceData({ orders: [{ orderId: 'legacy', title: 'Legacy item' }] })!.orders[0];
    expect(legacy.orderDate).toBeUndefined();
    expect(legacy.items[0].quantity).toBeUndefined();
    expect(legacy.totalAmount).toBeUndefined();
    expect(legacy.suspectName).toBeUndefined();
  });
  it('shows all supplied fields and missing quantity as dash, never a guessed one', () => {
    const data = fixture();
    const markup = renderToStaticMarkup(createElement(EcommerceOrderItems, { order: data.orders[0] }));
    expect(markup).toContain('Size S / Đỏ');
    expect(markup).toContain('Số lượng: -');
    expect(orderSnippet(data.orders[0])).toContain('09***123');
    expect(orderSnippet(data.orders[0])).toContain('Dòng tiếp theo');
    expect(markup).not.toContain('CLUE-POSH');
  });
  it('pins only receiver heading, order time, products, address, phone and total', () => {
    const order = { ...fixture().orders[0], orderDate: '12/10/2026 20:10' };
    const tree = EcommerceOrderHistory({ ...evidenceProps, orders: [order], filter: 'all', onOpen: noop, onFilter: noop });
    const item = elements(tree).find(e => e.type === StoryEvidenceTarget)?.props.item;
    expect(item).toMatchObject({
      title: order.recipientName,
      rawTimestamp: order.orderDate,
      source: { recordId: order.orderId, title: order.recipientName, rawTimestamp: order.orderDate },
    });
    expect(item?.snippet.split('\n')).toEqual([
      'Sản phẩm: - Sản phẩm được cấp - Size S / Đỏ', 'Địa chỉ: Địa chỉ rất dài', 'Dòng tiếp theo', 'Số điện thoại: 09***123',
      `Thành tiền: ${money(order.totalAmount)}`,
    ]);
    expect(loadCase('case_01').appsData.ecommerce.orders.every((record: { shippingAddress?: string }) =>
      !/đã giao|đã hủy|đang vận chuyển|\d{1,2}:\d{2}/i.test(record.shippingAddress ?? '')
    )).toBe(true);
  });
  it('combines quantity, product and variant in one evidence row per item', () => {
    const order = { ...fixture().orders[0], items: [
      { quantity: 2, productTitle: 'Áo polo', variantName: 'Xanh, L' },
      { quantity: 1, productTitle: 'Túi' },
      { variantName: 'Đỏ' },
    ] };
    expect(orderSnippet(order).split('\n').slice(0, 3)).toEqual([
      'Sản phẩm: 2 Áo polo - Xanh, L',
      'Sản phẩm: 1 Túi',
      'Sản phẩm: - - - Đỏ',
    ]);
  });
  it('opens ordinary records via tap and sends filter selection without collecting evidence', () => {
    const data = fixture();
    let opened = ''; let filter = ''; let collected = false;
    const tree = EcommerceOrderHistory({ ...evidenceProps, orders: data.orders, filter: 'all', onOpen: order => { opened = order.orderId; }, onFilter: value => { filter = value; }, onEvidence: () => { collected = true; } });
    const buttons = elements(tree).filter(e => e.type === 'button');
    buttons.find(e => e.props['aria-label'] === 'Xem đơn order-2')!.props.onClick!();
    expect(opened).toBe('order-2');
    expect(collected).toBe(false);
    buttons.find(e => e.props.children === 'Đang giao')!.props.onClick!();
    expect(filter).toBe('in_transit');
  });

  it('passes order and notification times to the shared subtitle once', () => {
    const data = fixture();
    const timestamp = '15/10/2026 20:48';
    const order = { ...data.orders[0], orderDate: timestamp };
    const notification = { ...data.notifications[0], timestamp };
    const trees = [
      EcommerceOrderHistory({ ...evidenceProps, orders: [order], filter: 'all', onOpen: noop, onFilter: noop }),
      EcommerceNotificationView({ ...evidenceProps, notifications: [notification], orders: [order], filter: 'all', onFilter: noop, onOpen: noop }),
    ];
    for (const tree of trees) {
      const item = elements(tree).find(element => element.type === StoryEvidenceTarget)!.props.item!;
      expect(item.subtitle).toBe(`Thời gian: ${timestamp}`);
      expect(item.snippet).not.toContain(timestamp);
      expect(item.source).toMatchObject({ rawTimestamp: timestamp, subtitle: item.subtitle, snippet: item.snippet });
    }
  });
  it('shows receiver, address, phone and total as separate order rows', () => {
    const order = fixture().orders[0];
    const html = renderToStaticMarkup(createElement(EcommerceOrderHistory, {
      ...evidenceProps, orders: [order], filter: 'all', onOpen: noop, onFilter: noop,
    }));
    expect(html).toContain(`<p>Người nhận: ${order.recipientName}</p>`);
    expect(html).toContain(`<p>Địa chỉ: ${order.shippingAddress}</p>`);
    expect(html).toContain(`<p>Số điện thoại: ${order.recipientPhone}</p>`);
    expect(html).toContain('Thành tiền:');
  });
  it('renders specified empty history and filter states with controls available', () => {
    const data = fixture();
    const render = (orders: typeof data.orders, filter: 'all' | 'completed') => renderToStaticMarkup(createElement(EcommerceOrderHistory, { ...evidenceProps, orders, filter, onOpen: noop, onFilter: noop }));
    expect(render([], 'all')).toContain('Chưa có đơn mua.');
    expect(render([data.orders[1]], 'completed')).toContain('Không có đơn phù hợp.');
    expect(render([], 'all')).toContain('Đang giao');
  });
  it('filters every notification category and resolves only supplied exact order references', () => {
    const data = fixture();
    expect(filterNotifications(data.notifications, 'all')).toHaveLength(4);
    for (const type of ['order', 'seller', 'promo', 'security'] as const) expect(filterNotifications(data.notifications, type)).toHaveLength(1);
    expect(linkedOrder(data.notifications[0], data.orders)?.orderId).toBe('order-1');
    expect(linkedOrder({ ...data.notifications[0], orderId: 'missing' }, data.orders)).toBeUndefined();
    expect(linkedOrder({ ...data.notifications[0], orderId: undefined }, data.orders)).toBeUndefined();
  });
  it('keeps unlinked notifications readable and without an invoice action', () => {
    const data = fixture();
    const markup = renderToStaticMarkup(createElement(EcommerceNotificationView, { ...evidenceProps, notifications: data.notifications, orders: data.orders, filter: 'all', onFilter: noop, onOpen: noop }));
    expect((markup.match(/aria-label="Xem đơn/g) ?? [])).toHaveLength(1);
    expect(markup).toContain('Nội dung giao hàng đầy đủ');
    expect(markup).not.toContain('CLUE-POSH');
  });
  it('disables active shop filtering without source activity and never infers online state', () => {
    const data = fixture();
    const tree = EcommerceChatListView({ ...evidenceProps, chats: data.chats, activeOnly: false, onFilter: noop, onOpen: noop });
    expect(elements(tree).find(e => e.type === 'button' && e.props.children === 'Đang hoạt động')?.props.disabled).toBe(true);
    const markup = renderToStaticMarkup(createElement(EcommerceChatDetailView, { ...evidenceProps, chat: data.chats[0] }));
    expect(markup).toContain('Nội dung được cấp');
    expect(markup).toContain('readOnly');
    expect(markup).not.toContain('Trực tuyến');
    expect(markup).not.toContain('Bạn đang hỏi về quy cách sản phẩm');
  });
  it('keeps history read-only and separates popular suggestions from evidence targets', () => {
    const data = fixture();
    data.popularSearches = ['Gợi ý quảng bá'];
    const markup = renderToStaticMarkup(createElement(EcommerceSearchOverlay, { ...evidenceProps, data }));
    expect(markup).toContain('Từ khóa có định danh');
    expect(markup).toMatch(/disabled=""[^>]*>Xóa lịch sử/);
    expect(markup).toContain('Tìm kiếm phổ biến');
    expect(markup).not.toContain('CLUE-POSH');
    expect(data.recentSearches[0].clueRefId).toBeUndefined();
    expect(data.recentSearches[1].clueRefId).toBe('CLUE-POSH-04');
  });
  it('pops only one navigation level, preserving origin', () => {
    const stack: EcommerceView[] = [{ screen: 'notifications' }, { screen: 'inbox' }, { screen: 'thread', shopId: 'shop' }];
    expect(popView(stack)).toEqual([{ screen: 'notifications' }, { screen: 'inbox' }]);
    expect(popView([{ screen: 'home' }])).toEqual([{ screen: 'home' }]);
    expect(stack).toHaveLength(3);
  });
  it('retains six clue references, source identity and only exact supplied suspect attribution', () => {
    for (let i = 1; i <= 6; i++) {
      const item = ecommerceEvidence('case-test', 'source-record', 'Titre', 'Texte', { clueRefId: `CLUE-POSH-0${i}` });
      expect(item).toMatchObject({ source: { caseId: 'case-test', recordId: 'source-record', clueRefId: `CLUE-POSH-0${i}` }, suspectToTag: '' });
    }
    const pool = [{ suspectId: 's1', displayName: 'Tên được cấp' }];
    const item = ecommerceEvidence('c', 'r', 'T', 'S', { suspectId: 's1' });
    expect(resolveEvidenceAttribution(item, pool).suspectToTag).toBe('Tên được cấp');
    expect(resolveEvidenceAttribution({ ...item, suspectId: 'missing' }, pool).suspectToTag).toBe('');
    expect(resolveEvidenceAttribution({ ...item, suspectToTag: 'Tên trực tiếp' }, pool).suspectToTag).toBe('Tên trực tiếp');
  });
  it('marks order evidence without treating the recipient as a visible profile', () => {
    const item = ecommerceEvidence('case-test', 'order', 'Recipient', 'Receipt', { recipientName: 'Recipient' }, '15/10', 'order');
    expect(item.kind).toBe('order');
    expect(item.source?.kind).toBe('order');
    expect(item.profileName).toBeUndefined();
  });
  it('blocks runtime image requests and permits only supplied embedded raster bytes', () => {
    for (const url of ['https://example.com/p.png', '/assets/p.png', 'javascript:alert(1)', 'data:image/svg+xml,<svg/>']) expect(safeImage(url)).toBeUndefined();
    expect(safeImage('data:image/png;base64,YWJj')).toBe('data:image/png;base64,YWJj');
  });
  it('renders missing data safely and accepts empty or valid modules without adding narrative', () => {
    const config = loadCase('case_01');
    const render = (appsData: typeof config.appsData) => renderToStaticMarkup(createElement(EcommerceApp, { caseData: { ...config, appsData }, onReturnHome: noop, onTagSuspect: noop, unlockedChallenges: new Set<string>() }));
    expect(render({})).toContain(getAppBrand('ecommerce').emptyStateMessage ?? 'Chưa có dữ liệu mua sắm cho màn này.');
    expect(render({ ecommerce: {} })).toContain('Chuột không dây Lô Gì Tếch');
    expect(render({ ecommerce: {} })).not.toContain('Mai Lễ Tân');
    expect(appDefinition.appId).toBe('ecommerce');
    expect(appDefinition.displayName).toBe(getAppDisplayName('ecommerce'));
    expect(appDefinition.themeColor).toBe('#EE4D2D');
  });
  it('uses JSON defaults only for omitted sections and preserves explicit case records', () => {
    const source = fixture();
    const before = JSON.stringify(source);
    const populated = resolveMarketplaceData({ orders: source.orders, chats: source.chats })!;
    expect(JSON.stringify(source)).toBe(before);
    expect(populated.orders).toEqual(source.orders);
    expect(populated.chats).toEqual(source.chats);
    expect(populated.products).toHaveLength(10);
    expect(resolveMarketplaceData({})?.chats.find(c => c.shopId === 'matme-official')?.pinnedProduct?.artwork).toBe('polo');
    expect(resolveMarketplaceData({ products: [], chats: [], orders: [], notifications: [] })).toMatchObject({ products: [], chats: [], orders: [], notifications: [] });
    expect(resolveMarketplaceData(null)).toBeNull();
    expect(resolveMarketplaceData('wrong')).toBeNull();
    expect(appDefinition.iconAsset).toBeTruthy();
  });
  it('ranks products using Vietnamese browsing patterns and recent searches without mutating JSON', () => {
    const data = normalizeEcommerceData({ browsingPatterns: ['NUOC HOA NU'], recentSearches: ['váy ngủ'], products: [
      { productId: 'unrelated', keywords: ['chuột'] },
      { productId: 'dress', keywords: ['váy ngủ'] },
      { productId: 'perfume', keywords: ['nước hoa', 'nước hoa nữ'] },
      { productId: 'tie', keywords: ['váy ngủ'] },
    ] })!;
    const before = JSON.stringify(data);
    expect(recommendProducts(data).map(p => p.productId)).toEqual(['perfume', 'dress', 'tie', 'unrelated']);
    expect(JSON.stringify(data)).toBe(before);
    expect(recommendProducts({ ...data, browsingPatterns: [], recentSearches: [] }).map(p => p.productId)).toEqual(['unrelated', 'dress', 'perfume', 'tie']);
    expect(resolveMarketplaceData({ products: [{ productId: 'only-case-product', keywords: ['váy ngủ'] }] })?.products.map(p => p.productId)).toEqual(['only-case-product']);
  });
});

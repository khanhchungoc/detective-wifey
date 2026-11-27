import type { ReactNode } from 'react';
import {
  IoChatbubbleEllipsesOutline,
  IoCartOutline,
  IoHomeOutline,
  IoNotificationsOutline,
  IoPersonOutline,
  IoImageOutline,
  IoArrowBack,
  IoHome,
  IoNotifications,
  IoPerson,
} from 'react-icons/io5';
import type { EcommerceTab } from '../types';
import { safeImage } from '../ecommerceData';
import { SHOP_AVATAR_TILES } from '../shopAvatars';
import { ProductArtwork } from './ProductArtwork';
import shopAvatarSheet from '../assets/shopoo-shop-avatar-sheet.jpg';

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="ecommerce-empty">{children}</p>;
}

export function Thumbnail({ url, artwork }: { url?: string; artwork?: string }) {
  const source = safeImage(url);
  return (
    <span className="ecommerce-thumbnail">
      {source ? (
        <img src={source} alt="" />
      ) : artwork ? (
        <ProductArtwork kind={artwork} />
      ) : (
        <IoImageOutline aria-hidden="true" />
      )}
    </span>
  );
}

export function ShopAvatar({ logo, style, shopId }: { logo?: string; style?: string; shopId?: string }) {
  const tile = shopId ? SHOP_AVATAR_TILES[shopId] : undefined;
  if (tile !== undefined) {
    const column = tile % 4;
    const row = Math.floor(tile / 4);
    return (
      <span
        aria-hidden="true"
        className="ecommerce-shop-avatar ecommerce-shop-avatar-photo"
        style={{
          backgroundImage: `url(${shopAvatarSheet})`,
          backgroundSize: '400% 400%',
          backgroundPosition: `${(column / 3) * 100}% ${(row / 3) * 100}%`,
          backgroundRepeat: 'no-repeat',
        }}
      />
    );
  }

  return (
    <span className={`ecommerce-shop-avatar ecommerce-shop-logo-${style ?? 'default'}`}>
      {logo ? <span>{logo}</span> : <IoImageOutline aria-hidden="true" />}
    </span>
  );
}

export function DisabledControl({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <button type="button" disabled aria-label={label} className="ecommerce-disabled">
      {children}
    </button>
  );
}

export function EcommerceHeader({
  title,
  onBack,
  onChat,
  cartCount,
  chatCount,
  children,
}: {
  title: string;
  onBack?: () => void;
  onChat?: () => void;
  cartCount?: number;
  chatCount?: number;
  children?: ReactNode;
}) {
  return (
    <header className="ecommerce-header">
      {onBack && (
        <button type="button" onClick={onBack} aria-label="Quay lại">
          <IoArrowBack />
        </button>
      )}
      {children ?? <h1>{title}</h1>}
      {onChat && (
        <div className="ecommerce-header-actions">
          <DisabledControl label="Giỏ hàng">
            <IoCartOutline />
            {cartCount !== undefined && cartCount > 0 && (
              <span className="ecommerce-badge">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </DisabledControl>
          <button type="button" onClick={onChat} aria-label="Trò chuyện">
            <IoChatbubbleEllipsesOutline />
            {chatCount !== undefined && chatCount > 0 && (
              <span className="ecommerce-badge">
                {chatCount > 99 ? '99+' : chatCount}
              </span>
            )}
          </button>
        </div>
      )}
    </header>
  );
}

export const PosheeHeader = EcommerceHeader;

export function EcommerceTabs({
  active,
  onSelect,
  unread,
}: {
  active: EcommerceTab;
  onSelect: (tab: EcommerceTab) => void;
  unread?: number;
}) {
  return (
    <nav className="app-bottom-nav ecommerce-tabs" aria-label="Điều hướng Mua sắm">
      {(
        [
          { id: 'home', title: 'Trang chủ', icon: active === 'home' ? IoHome : IoHomeOutline },
          {
            id: 'notifications',
            title: 'Thông báo',
            icon: active === 'notifications' ? IoNotifications : IoNotificationsOutline,
          },
          {
            id: 'profile',
            title: 'Tôi',
            icon: active === 'profile' ? IoPerson : IoPersonOutline,
          },
        ] as const
      ).map((tab) => (
        <button
          type="button"
          key={tab.id}
          aria-current={active === tab.id ? 'page' : undefined}
          onClick={() => onSelect(tab.id)}
        >
          <tab.icon />
          <span>{tab.title}</span>
          {tab.id === 'notifications' && unread !== undefined && unread > 0 && (
            <span className="ecommerce-badge">{unread}</span>
          )}
        </button>
      ))}
    </nav>
  );
}

export const PosheeTabs = EcommerceTabs;

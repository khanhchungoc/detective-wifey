import React, { useState, useRef, useEffect, type CSSProperties } from 'react';
import { AppDefinition } from '../../shared/contracts/app-contracts';

interface AppIconSquircleProps {
  app: Pick<AppDefinition, 'icon' | 'displayName' | 'iconAsset' | 'themeGradient' | 'notificationBadgeCount'> & Partial<Pick<AppDefinition, 'appId'>>;
  onClick: () => void;
  overrideBadgeCount?: number;
  hideLabel?: boolean;
  isGrayedOut?: boolean;
}

export const AppIconSquircle: React.FC<AppIconSquircleProps> = ({
  app,
  onClick,
  overrideBadgeCount,
  hideLabel = false,
  isGrayedOut = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const downTimeRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const IconComponent = app.icon;
  const badgeCount =
    overrideBadgeCount !== undefined ? overrideBadgeCount : app.notificationBadgeCount || 0;

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.isPrimary && (e.pointerType !== 'mouse' || e.button === 0)) {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      downTimeRef.current = Date.now();
      setIsPressed(true);
    }
  };

  const handlePointerUp = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = Date.now() - downTimeRef.current;
    const remaining = Math.max(0, 100 - elapsed);
    if (remaining > 0) {
      timerRef.current = window.setTimeout(() => {
        setIsPressed(false);
        timerRef.current = null;
      }, remaining);
    } else {
      setIsPressed(false);
    }
  };

  const handlePointerCancel = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressed(false);
  };

  return (
    <button
      type="button"
      data-launch-app={app.appId ?? 'camera'}
      data-grayed-out={isGrayedOut ? 'true' : undefined}
      data-pressed={isPressed ? 'true' : undefined}
      aria-disabled={isGrayedOut ? 'true' : undefined}
      style={{ '--launcher-motion-name': `launcher-${app.appId ?? 'camera'}` } as CSSProperties}
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      className={`flex flex-col items-center justify-center p-1 min-h-[48px] min-w-[48px] w-full group touch-manipulation select-none -webkit-tap-highlight-transparent ${isGrayedOut ? 'opacity-40' : ''} transition-transform cursor-pointer focus:outline-none`}
      aria-label={isGrayedOut ? `Ứng dụng ${app.displayName} (Tính năng đang phát triển)` : `Mở ứng dụng ${app.displayName}`}
    >
      <div className="relative">
        <div
          className={`phone-app-icon ${app.iconAsset ? '' : `bg-gradient-to-br ${app.themeGradient} shadow-md group-hover:shadow-lg`} ${isGrayedOut ? 'grayscale contrast-75 brightness-90' : ''} flex items-center justify-center text-white relative overflow-hidden transition-all`}
          style={{
            borderRadius: '22.5%',
            ...(isGrayedOut ? { filter: 'grayscale(100%) brightness(0.85)' } : {}),
          }}
        >
          {app.iconAsset ? (
            <img src={app.iconAsset} alt="" aria-hidden="true" draggable={false} className="w-full h-full drop-shadow-md group-hover:drop-shadow-lg" />
          ) : (
            <IconComponent className="w-8 h-8" />
          )}

          {/* Subtle darken layer shown on touch or click */}
          <div
            aria-hidden="true"
            className="phone-app-icon-overlay absolute inset-0 bg-black/25 opacity-0 transition-opacity duration-75 pointer-events-none"
          />
        </div>

        {badgeCount > 0 && !isGrayedOut && (
          <span className="absolute -top-[6px] -right-[8px] z-10 box-border flex h-[24px] min-w-[24px] items-center justify-center rounded-full bg-[#FF3B30] px-[6px] text-[16px] font-normal leading-none text-white tabular-nums [font-family:-apple-system,BlinkMacSystemFont,'Helvetica_Neue',sans-serif] pointer-events-none shadow-sm">
            {badgeCount}
          </span>
        )}
      </div>

      {!hideLabel && (
        <span className={`text-ios-caption-1 font-medium ${isGrayedOut ? 'text-white/60' : 'text-white'} mt-1 tracking-tight truncate w-full text-center max-w-[76px] tall:max-w-[84px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]`}>
          {app.displayName}
        </span>
      )}
    </button>
  );
};

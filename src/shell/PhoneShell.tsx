import { useMotionState } from '../shared/motion/useMotionState';
import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import type { AppDefinition, AppId } from '../shared/contracts/app-contracts';
import type { DeviceMetadata, NotificationToast } from '../shared/contracts/case-schema';
import { detectDeviceMode, detectFullscreen, isMobileDevice, shouldShowStatusBar } from './deviceMode';
import { systemForeground } from './systemChrome';
import { StatusBar } from './components/StatusBar';
import { AppIconSquircle } from './components/AppIconSquircle';
import { NotificationBanner } from './components/NotificationBanner';
import { NotebookTab } from './components/NotebookTab';
import { ControlCenter, isControlSwipe, setNotificationHintSeen } from './components/ControlCenter';
import { PwaGuideSheet } from './components/PwaGuideSheet';
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { usePwa } from './usePwa';
import { useNavigationGuard } from './useNavigationGuard';
import { AppErrorBoundary } from '../shared/ui/AppErrorBoundary';
import { useDialogFocus } from '../shared/ui/useDialogFocus';
import { useSwipeBack } from '../shared/gestures/useSwipeBack';
import { useSwipeHome } from '../shared/gestures/useSwipeHome';
import { NOTEBOOK_SLIDE_EASING, NOTEBOOK_OPEN_DURATION_MS, NOTEBOOK_CLOSE_DURATION_MS } from '../shared/motion/anchoredOverlay';
import defaultWallpaper from './assets/hoang-technosoft-selfie-wallpaper-v3.jpg';
import { IoCamera, IoSearchOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

export interface PhoneShellProps {
  deviceMetadata: DeviceMetadata;
  activeAppId: AppId | 'home';
  activeAppDefinition: AppDefinition | null;
  activeUpperApps: AppDefinition[];
  activeDockApps: AppDefinition[];
  grayedOutAppIds?: string[];
  systemAlertToast: string | null;
  incomingNotification?: NotificationToast | null;
  children: ReactNode;
  overlays: ReactNode;
  renderLevelSelector: (onClose: () => void) => ReactNode;
  onLaunchApp: (appId: AppId) => void;
  onReturnHome: () => void;
  onRestartLevel: () => void;
  onOpenNotebook: () => void;
  onCloseNotebook?: () => void;
  notebookOpen?: boolean;
  onNotify: (message: string) => void;
  enableNavigationGuard?: boolean;
}

/** Phone presentation and transient OS state. Gameplay is supplied by the host. */
export const PhoneShell: React.FC<PhoneShellProps> = ({
  deviceMetadata, activeAppId, activeAppDefinition, activeUpperApps, activeDockApps,
  grayedOutAppIds,
  systemAlertToast, incomingNotification, children, overlays, renderLevelSelector,
  onLaunchApp: handleLaunchApp, onReturnHome,
  onOpenNotebook, onCloseNotebook, notebookOpen = false, onNotify,
  enableNavigationGuard = true,
}) => {
  const { showExitConfirm, handleStay, handleLeave } = useNavigationGuard({
    enabled: enableNavigationGuard,
  });
  const [isIOS] = useState(() => typeof navigator !== 'undefined' && detectDeviceMode(navigator) === 'ios');
  const [isMobile] = useState(() => typeof navigator !== 'undefined' && isMobileDevice(navigator));
  const [isFullscreen, setIsFullscreen] = useState(() => detectFullscreen());
  const showStatusBar = shouldShowStatusBar({ isMobile, isFullscreen });
  const [activeToast, setActiveToast] = useMotionState<NotificationToast | null>(null, 'overlay');
  const [showLevelSheet, setShowLevelSheet] = useMotionState(false, 'sheet');
  const [showPwaGuide, setShowPwaGuide] = useMotionState(false, 'sheet');
  const [controlCenterOpen, setControlCenterOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const pwa = usePwa();
  const previousApp = useRef(activeAppId);
  const shellRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const homeSwipeStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const suppressHomeClick = useRef(false);

  const handleHomePointerDown = (event: React.PointerEvent) => {
    if (activeAppId !== 'home' || event.button !== 0 || !event.isPrimary) return;
    suppressHomeClick.current = false;
    homeSwipeStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };

  const handleHomePointerUp = (event: React.PointerEvent) => {
    const active = homeSwipeStart.current;
    homeSwipeStart.current = null;
    if (!active || active.id !== event.pointerId || activeAppId !== 'home') return;
    const dx = event.clientX - active.x;
    const dy = event.clientY - active.y;
    if (isControlSwipe(dx, dy, 'down')) {
      suppressHomeClick.current = true;
      setNotificationHintSeen();
      setControlCenterOpen(true);
    }
  };

  const handleHomePointerCancel = () => {
    homeSwipeStart.current = null;
    suppressHomeClick.current = false;
  };

  const handleHomeClickCapture = (event: React.MouseEvent) => {
    if (suppressHomeClick.current) {
      suppressHomeClick.current = false;
      event.stopPropagation();
      event.preventDefault();
    }
  };
  const sheetOpen = showLevelSheet || showPwaGuide;
  const sheetKeyDown = useDialogFocus(sheetOpen, sheetRef, () => {
    setShowLevelSheet(false); setShowPwaGuide(false);
  });
  useEffect(() => {
    if (!sheetOpen) return;
    return () => shellRef.current?.querySelector<HTMLElement>('[data-control-center-trigger]')?.focus({ preventScroll: true });
  }, [sheetOpen]);
  const appTheme = activeAppDefinition?.themeColor ?? '#0f172a';
  const bottomTheme = activeAppDefinition?.bottomBarColor ?? appTheme;
  const systemInsets = {
    '--phone-system-top': showStatusBar ? '59px' : 'env(safe-area-inset-top, 0px)',
    '--phone-system-bottom': isIOS ? 'env(safe-area-inset-bottom, 0px)' : 'calc(34px + env(safe-area-inset-bottom, 0px))',
  } as React.CSSProperties;

  useEffect(() => {
    const previous = previousApp.current;
    previousApp.current = activeAppId;
    if (previous === activeAppId) return;
    if (activeAppId === 'home') {
      Array.from(shellRef.current?.querySelectorAll<HTMLButtonElement>('[data-launch-app]') ?? [])
        .find(button => button.dataset.launchApp === previous)?.focus({ preventScroll: true });
    } else {
      shellRef.current?.querySelector<HTMLElement>('[data-app-viewport]')?.focus({ preventScroll: true });
    }
  }, [activeAppId]);

  useEffect(() => {
    let timer: number;
    const updateClock = () => {
      const now = new Date();
      setCurrentDate(previous => Math.floor(previous.getTime() / 60_000) === Math.floor(now.getTime() / 60_000) ? previous : now);
      window.clearTimeout(timer);
      if (!document.hidden) timer = window.setTimeout(updateClock, 60_000 - now.getTime() % 60_000);
    };
    updateClock();
    window.addEventListener('focus', updateClock);
    document.addEventListener('visibilitychange', updateClock);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('focus', updateClock);
      document.removeEventListener('visibilitychange', updateClock);
    };
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(detectFullscreen());
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    let fsMedia: MediaQueryList | undefined;
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      try {
        fsMedia = window.matchMedia('(display-mode: fullscreen)');
        fsMedia.addEventListener?.('change', handleFsChange);
      } catch {
        // unsupported media query
      }
    }
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      fsMedia?.removeEventListener?.('change', handleFsChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    if (isIOS || !document.documentElement.requestFullscreen) {
      setShowPwaGuide(true);
      return;
    }
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setIsFullscreen(detectFullscreen());
    } catch {
      setIsFullscreen(detectFullscreen());
      onNotify('Không thể bật chế độ toàn màn hình. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    if (incomingNotification) {
      setActiveToast(incomingNotification);
    }
  }, [incomingNotification]);

  const shellGesturesEnabled = activeAppId !== 'home' && !notebookOpen && !controlCenterOpen && !sheetOpen;
  const shellAppSwipeHandlers = useSwipeBack({ onBack: onReturnHome, enabled: shellGesturesEnabled });
  const shellHomeSwipeHandlers = useSwipeHome({
    onHome: onReturnHome,
    enabled: shellGesturesEnabled,
    triggerAreaHeight: 72,
    getContainer: () => shellRef.current,
  });

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', activeAppDefinition?.themeColor || deviceMetadata.pwaThemeColor || '#0f172a',
    );
  }, [activeAppDefinition, deviceMetadata.pwaThemeColor]);

  return (
    <div
      ref={shellRef}
      data-app-transition-bounds
      data-device-mode={isIOS ? 'ios' : 'default'}
      className="phone-shell flex flex-col relative overflow-hidden select-none font-sans bg-[#090d16]"
      style={systemInsets}
      {...shellHomeSwipeHandlers}
    >
      <div
        data-phone-screen
        data-notebook-open={notebookOpen}
        inert={notebookOpen || controlCenterOpen || sheetOpen}
        aria-hidden={notebookOpen || controlCenterOpen || sheetOpen}
        className="phone-screen-canvas flex-1 flex flex-col relative min-h-0 w-full h-full overflow-hidden"
        style={{
          ...systemInsets,
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.5) 20%, transparent 42%), url(${defaultWallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          ...(isIOS || !showStatusBar ? { paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)', paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' } : {}),
          transform: notebookOpen
            ? 'perspective(1000px) translate3d(0, 0, -18px) scale(0.97)'
            : 'perspective(1000px) translate3d(0, 0, 0px) scale(1)',
          transformOrigin: 'center center',
          borderRadius: notebookOpen ? '28px' : '0px',
          WebkitMaskImage: notebookOpen ? '-webkit-radial-gradient(white, black)' : undefined,
          boxShadow: notebookOpen ? '0 14px 34px rgba(0, 0, 0, 0.45)' : 'none',
          transition: `transform ${notebookOpen ? `${NOTEBOOK_OPEN_DURATION_MS}ms` : `${NOTEBOOK_CLOSE_DURATION_MS}ms`} ${NOTEBOOK_SLIDE_EASING}, ` +
            `border-radius ${notebookOpen ? `${NOTEBOOK_OPEN_DURATION_MS}ms` : `${NOTEBOOK_CLOSE_DURATION_MS}ms`} ${NOTEBOOK_SLIDE_EASING}, ` +
            `box-shadow ${notebookOpen ? `${NOTEBOOK_OPEN_DURATION_MS}ms` : `${NOTEBOOK_CLOSE_DURATION_MS}ms`} ${NOTEBOOK_SLIDE_EASING}`,
          willChange: 'transform',
        }}
      >
      {/* 1. Phone OS Status Bar */}
      {showStatusBar && <StatusBar
        overlay
        currentDate={currentDate}
        backgroundColor={activeAppDefinition ? activeAppDefinition.themeColor : 'transparent'}
      />}

      {/* 2. Top Notification Toast Banner */}
      <NotificationBanner
        toast={activeToast}
        onClose={() => setActiveToast(null)}
        onClick={(toast) => {
          setActiveToast(null);
          handleLaunchApp(toast.sourceAppId as AppId);
        }}
      />

      {/* 3. System Alert Toast (iOS Dynamic Pill / HUD) */}
      {systemAlertToast && (
        <div
          role="status"
          aria-live="polite"
          className="absolute left-1/2 -translate-x-1/2 z-[75] max-w-[90%] w-auto px-4 py-2 rounded-full bg-slate-900/90 backdrop-blur-2xl border border-white/20 text-white shadow-[0_12px_28px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.25)] flex items-center justify-center gap-2 animate-slideDown pointer-events-none select-none"
          style={{ top: 'calc(var(--phone-system-top, 59px) + 8px)' }}
        >
          <IoShieldCheckmarkOutline className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-ios-caption-1 font-medium tracking-tight text-white/95 whitespace-nowrap overflow-hidden text-ellipsis">
            {systemAlertToast}
          </span>
        </div>
      )}

      {/* 4. Active Screen Content */}
      <div className="phone-motion-content flex-1 flex flex-col relative min-h-0 overflow-hidden">
        {(
          /* =================================================================
             HOME SCREEN LAUNCHER (PhoneOSHomeView)
             ================================================================= */
          <div
            inert={activeAppId !== 'home'}
            aria-hidden={activeAppId !== 'home'}
            data-launcher-hidden={activeAppId !== 'home'}
            className={`phone-launcher flex-1 flex flex-col justify-between relative min-h-0 ${activeAppId !== 'home' ? 'pointer-events-none' : ''}`}
            style={{ touchAction: activeAppId === 'home' ? 'none' : undefined }}
            onPointerDown={handleHomePointerDown}
            onPointerUp={handleHomePointerUp}
            onPointerCancel={handleHomePointerCancel}
            onClickCapture={handleHomeClickCapture}
          >
            {/* Top Section: Clock & Upper Apps */}
            <div className="flex flex-col min-h-0">
              {/* Clock Widget */}
              <div className="phone-clock-widget">
                <div className="text-4xl font-light tracking-tight text-white leading-none tabular-nums">
                  {currentDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
                <div className="text-ios-caption-2 tall:text-ios-caption-1 font-medium text-slate-300 mt-0.5 tall:mt-1">
                  {currentDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
              </div>

              {/* Upper App Grid (Level-Based Filtered) */}
              <div className="phone-app-grid grid grid-cols-4">
                {activeUpperApps.map((app) => {
                  const isGrayedOut = Boolean(grayedOutAppIds?.includes(app.appId));
                  return (
                    <AppIconSquircle
                      key={app.appId}
                      app={app}
                      isGrayedOut={isGrayedOut}
                      onClick={() => {
                        if (isGrayedOut) {
                          onNotify(`${app.displayName}: Tính năng đang phát triển cho các màn sau.`);
                        } else {
                          handleLaunchApp(app.appId);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Bottom Section: IoSearchOutline Pill, Dock, Home Bar */}
            <div className="flex flex-col gap-3 shrink-0">
              {/* Search Pill */}
              <div className="flex justify-center mb-0.5 tall:mb-1">
                <div className="glass-subtle rounded-full px-4 min-h-[44px] flex items-center gap-1.5 text-ios-caption-1 text-white/90">
                  <IoSearchOutline aria-hidden="true" className="w-3.5 h-3.5 text-sky-300" />
                  <span>Tìm kiếm</span>
                </div>
              </div>

              {/* Frosted Glass Dock Tray (Fast Access Apps) */}
              <div className="glass-dock phone-dock">
                <div className="phone-dock-grid grid grid-flow-col auto-cols-fr">
                  {activeDockApps.map((app) => {
                    const isGrayedOut = Boolean(grayedOutAppIds?.includes(app.appId));
                    return (
                      <AppIconSquircle
                        key={app.appId}
                        app={app}
                        hideLabel
                        isGrayedOut={isGrayedOut}
                        onClick={() => {
                          if (isGrayedOut) {
                            onNotify(`${app.displayName}: Tính năng đang phát triển cho các màn sau.`);
                          } else {
                            handleLaunchApp(app.appId);
                          }
                        }}
                      />
                    );
                  })}
                  {activeDockApps.length < 4 && (
                    <AppIconSquircle
                      app={{ displayName: 'Camera', icon: IoCamera, themeGradient: 'from-slate-400 to-slate-600' }}
                      hideLabel
                      isGrayedOut
                      onClick={() => onNotify('Camera: chức năng đang phát triển.')}
                    />
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {(
          /* =================================================================
             ACTIVE MICRO-APP VIEWPORT
             ================================================================= */
        <div
          data-app-surface
          hidden={activeAppId === 'home'}
          inert={activeAppId === 'home'}
          aria-hidden={activeAppId === 'home'}
          className="absolute inset-0 z-10 flex flex-col overflow-hidden shadow-2xl"
          style={{
            display: activeAppId === 'home' ? 'none' : undefined,
            backgroundColor: appTheme,
            borderRadius: notebookOpen ? '28px' : '0px',
            transition: `border-radius ${notebookOpen ? `${NOTEBOOK_OPEN_DURATION_MS}ms` : `${NOTEBOOK_CLOSE_DURATION_MS}ms`} ${NOTEBOOK_SLIDE_EASING}`,
            ...(isIOS ? { paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' } : {}),
            touchAction: 'pan-y',
          }}
        >
          <div data-app-status-background aria-hidden="true" className="shrink-0" style={{ height: 'var(--phone-system-top)' }} />
          <div data-app-viewport tabIndex={-1} className="relative min-h-0 flex-1 flex flex-col overflow-hidden outline-none" style={{ touchAction: 'pan-y' }} {...shellAppSwipeHandlers}>
            <AppErrorBoundary
              onErrorFallback={() => {
                onReturnHome();
                onNotify('Ứng dụng tạm thời không phản hồi. Vui lòng thử lại!');
              }}
            >
              {children}
            </AppErrorBoundary>

          </div>
          <div data-app-home-background aria-hidden="true" className="shrink-0" style={{ height: 'var(--phone-system-bottom)', backgroundColor: bottomTheme, touchAction: 'none' }} />
        </div>
      )}

      {/* One gesture area keeps launcher and app geometry identical. */}
      {!isIOS && <button
        type="button"
        onClick={onReturnHome}
        className="phone-system-home relative z-40 flex w-full shrink-0 items-center justify-center cursor-pointer active:opacity-75 transition-opacity"
        style={{
          color: activeAppId === 'home' ? '#FFFFFF' : systemForeground(bottomTheme),
          height: 'var(--phone-system-bottom)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          touchAction: 'none',
        }}
        aria-label="Về trang chủ"
      >
        <span aria-hidden="true" className="h-1 w-32 rounded-full bg-current transition-transform duration-150" />
      </button>}

      </div>

      <ControlCenter
        open={controlCenterOpen}
        disabled={notebookOpen || showLevelSheet || showPwaGuide}
        isFullscreen={isFullscreen}
        showStatusBar={showStatusBar}
        onToggleFullscreen={handleToggleFullscreen}
        onGoHome={onReturnHome}
        onOpenLevels={() => setShowLevelSheet(true)}
        onOpenChange={setControlCenterOpen}
      />

      {overlays}

      <NotebookTab
        open={notebookOpen}
        hidden={controlCenterOpen || showLevelSheet || showPwaGuide}
        onOpen={onOpenNotebook}
        onClose={onCloseNotebook}
      />

      <div ref={sheetRef} className="contents" role={sheetOpen ? 'dialog' : undefined} aria-modal={sheetOpen || undefined}
        aria-label={showLevelSheet ? 'Chọn màn chơi' : showPwaGuide ? 'Hướng dẫn toàn màn hình' : undefined} onKeyDown={sheetKeyDown}>
      {/* 7. Level Selector Modal Sheet */}
      {showLevelSheet && renderLevelSelector(() => setShowLevelSheet(false))}

      {/* 8. PWA Guidance Modal Sheet */}
      {showPwaGuide && (
        <PwaGuideSheet
          pwa={pwa}
          onClose={() => setShowPwaGuide(false)}
          onPreviewFullscreen={handleToggleFullscreen}
          isIOS={isIOS}
        />
      )}
      </div>

      {/* 9. Exit Confirmation Modal */}
      {showExitConfirm && (
        <ExitConfirmModal
          isOpen={showExitConfirm}
          onStay={handleStay}
          onLeave={handleLeave}
        />
      )}

    </div>
  );
};

export default PhoneShell;

import { useEffect, useRef, useState } from 'react';
import { IoChevronDown, IoChevronUp, IoContractOutline, IoExpandOutline, IoHomeOutline, IoLayersOutline } from 'react-icons/io5';
import { useDialogFocus } from '../../shared/ui/useDialogFocus';

export const isControlSwipe = (dx: number, dy: number, direction: 'down' | 'up') =>
  (direction === 'down' ? dy : -dy) >= 44 && Math.abs(dy) > Math.abs(dx) * 1.25;

export const NOTIFICATION_HINT_KEY = 'detective_notification_swiped_down';

const getStorage = (): Storage | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch {
    // blocked by security policy or environment
  }
  return null;
};

export function isNotificationHintSeen(): boolean {
  const storage = getStorage();
  return Boolean(storage?.getItem(NOTIFICATION_HINT_KEY) === 'true');
}

export function setNotificationHintSeen(): void {
  const storage = getStorage();
  try {
    storage?.setItem(NOTIFICATION_HINT_KEY, 'true');
  } catch {
    // local storage unavailable
  }
}

export function ControlCenter({ disabled, isFullscreen, showStatusBar = true, onToggleFullscreen, onGoHome, onOpenLevels, open: controlledOpen, onOpenChange }: {
  disabled: boolean; isFullscreen: boolean; showStatusBar?: boolean; onToggleFullscreen: () => void;
  onGoHome: () => void; onOpenLevels: () => void;
  open?: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const [initialHint, setInitialHint] = useState(() => !isNotificationHintSeen());
  const [pendingChevron, setPendingChevron] = useState(false);
  const pendingChevronTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const suppressClick = useRef(false);
  const panelSwipeStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const suppressActionClick = useRef(false);
  const hadOpened = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const change = (next: boolean) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange(next);
  };

  useEffect(() => {
    if (open) {
      hadOpened.current = true;
      setPendingChevron(false);
      if (pendingChevronTimer.current) {
        clearTimeout(pendingChevronTimer.current);
        pendingChevronTimer.current = null;
      }
    } else if (hadOpened.current) {
      document.querySelector<HTMLElement>('[data-control-center-trigger]')?.focus({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (pendingChevronTimer.current) {
        clearTimeout(pendingChevronTimer.current);
      }
    };
  }, []);

  const onKeyDown = useDialogFocus(open, dialogRef, () => change(false));

  const handleTriggerOpen = () => {
    if (initialHint) {
      setInitialHint(false);
      setNotificationHintSeen();
    }
    setPendingChevron(false);
    if (pendingChevronTimer.current) {
      clearTimeout(pendingChevronTimer.current);
      pendingChevronTimer.current = null;
    }
    change(true);
  };

  const handleSwipeDown = () => {
    if (showStatusBar) {
      handleTriggerOpen();
      return;
    }

    if (pendingChevron) {
      handleTriggerOpen();
    } else {
      if (initialHint) {
        setInitialHint(false);
        setNotificationHintSeen();
      }
      setPendingChevron(true);
      if (pendingChevronTimer.current) {
        clearTimeout(pendingChevronTimer.current);
      }
      pendingChevronTimer.current = setTimeout(() => {
        setPendingChevron(false);
        pendingChevronTimer.current = null;
      }, 3500);
    }
  };

  const actions = [
    { label: isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình', icon: isFullscreen ? IoContractOutline : IoExpandOutline, run: onToggleFullscreen },
    { label: 'Chọn màn chơi', icon: IoLayersOutline, run: onOpenLevels },
    { label: 'Màn hình chính', icon: IoHomeOutline, run: onGoHome },
  ];

  const showChevron = (!showStatusBar && pendingChevron) || (showStatusBar && initialHint);

  return <>
    <button data-control-center-trigger type="button" aria-label="Mở trung tâm điều khiển"
      aria-haspopup="dialog" aria-expanded={open} disabled={disabled} tabIndex={open ? -1 : 0}
      className="absolute inset-x-0 top-0 z-40 flex h-[var(--phone-system-top,59px)] min-h-[44px] items-start justify-center text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
      style={{ touchAction: 'none', top: 'env(safe-area-inset-top, 0px)', pointerEvents: disabled || open ? 'none' : 'auto' }}
      onPointerDown={event => {
        if (event.button !== 0 || !event.isPrimary) return;
        event.stopPropagation(); suppressClick.current = false;
        start.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
        event.currentTarget.setPointerCapture?.(event.pointerId);
      }}
      onPointerUp={event => {
        const active = start.current;
        start.current = null;
        if (!active || active.id !== event.pointerId) return;
        const dx = event.clientX - active.x, dy = event.clientY - active.y;
        suppressClick.current = Math.hypot(dx, dy) > 6;
        if (isControlSwipe(dx, dy, 'down')) handleSwipeDown();
      }} onPointerCancel={() => { start.current = null; suppressClick.current = true; }}
      onClick={event => {
        event.stopPropagation();
      }}>
      {showChevron && (
        <span
          data-notification-swipe-hint
          className="mt-1 flex h-4 w-7 items-center justify-center rounded-full bg-slate-900/80 border border-white/20 text-white/90 shadow-sm animate-[bounce_1s_ease-in-out_3]"
          aria-hidden="true"
        >
          <IoChevronDown className="h-3 w-3" />
        </span>
      )}
    </button>

    <div
      ref={dialogRef}
      inert={!open}
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
      aria-label="Trung tâm điều khiển"
      className="absolute inset-0 z-50 overflow-hidden"
      style={{ pointerEvents: open ? 'auto' : 'none' }}
      onKeyDown={onKeyDown}
    >
      {/* 1. Hardware-accelerated smooth CSS blurred backdrop: stationary layer so backdrop-blur never snaps */}
      <div
        className={`absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity duration-300 ease-out ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ touchAction: 'none' }}
        onClick={() => change(false)}
      />

      {/* 2. Interactive sliding panel with authentic iOS banner spring curve */}
      <div
        data-dropdown-panel
        className={`absolute inset-0 flex flex-col justify-start transition-transform duration-300 ${
          open ? 'translate-y-0 pointer-events-auto' : '-translate-y-full pointer-events-none'
        }`}
        style={{
          touchAction: 'none',
          transitionTimingFunction: open ? 'cubic-bezier(0.16, 1, 0.3, 1)' : 'cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onPointerDown={event => {
          if (event.button !== 0 || !event.isPrimary) return;
          suppressActionClick.current = false;
          panelSwipeStart.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // fallback if pointer capture is unsupported
          }
        }}
        onPointerUp={event => {
          const active = panelSwipeStart.current;
          panelSwipeStart.current = null;
          if (!active || active.id !== event.pointerId) return;
          const dx = event.clientX - active.x;
          const dy = event.clientY - active.y;
          if (Math.hypot(dx, dy) > 8) {
            suppressActionClick.current = true;
          }
          if (
            isControlSwipe(dx, dy, 'up') ||
            (dy <= -36 && Math.abs(dy) > Math.abs(dx) * 1.1) ||
            (dx >= 44 && Math.abs(dx) > Math.abs(dy) * 1.25)
          ) {
            change(false);
          }
        }}
        onPointerCancel={() => {
          panelSwipeStart.current = null;
          suppressActionClick.current = true;
        }}
        onClick={event => {
          if (suppressActionClick.current) {
            suppressActionClick.current = false;
            return;
          }
          if (event.target === event.currentTarget) {
            change(false);
          }
        }}
      >
        <section
          className="mx-auto flex w-full max-w-md flex-col px-6 text-white"
          style={{ paddingTop: 'max(72px, calc(env(safe-area-inset-top, 0px) + 40px))' }}
        >
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Trung tâm điều khiển</h2>
          <div className="grid grid-cols-2 gap-3">
            {actions.map(({ label, icon: Icon, run }, index) => (
              <button
                key={index}
                type="button"
                className={`flex min-h-[120px] flex-col items-start justify-between rounded-[28px] border border-white/20 bg-white/15 p-5 text-left shadow-lg hover:bg-white/25 active:scale-95 ${index === 0 ? 'col-span-2' : ''}`}
                onClick={() => {
                  if (suppressActionClick.current) {
                    suppressActionClick.current = false;
                    return;
                  }
                  change(false);
                  run();
                }}
              >
                <Icon aria-hidden className="h-8 w-8" />
                <span className="mt-3 text-sm font-semibold">{label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Đóng trung tâm điều khiển"
            onClick={() => {
              if (suppressActionClick.current) {
                suppressActionClick.current = false;
                return;
              }
              change(false);
            }}
            className="mt-8 flex min-h-11 items-center justify-center self-center rounded-full px-8 hover:bg-white/15"
          >
            <IoChevronUp aria-hidden className="h-6 w-6" />
          </button>
        </section>
      </div>
    </div>
  </>;
}

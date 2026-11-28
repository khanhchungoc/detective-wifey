import { useCallback, useId, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { IoClose } from 'react-icons/io5';
import { useSwipeBack } from '../gestures/useSwipeBack';
import {
  SHEET_BACKDROP_OPEN_MS,
  SHEET_CLOSE_EASE,
  SHEET_CLOSE_MS,
  SHEET_OPEN_EASE,
  SHEET_OPEN_MS,
} from '../motion/sheetMotion';

interface BottomSheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  suspended?: boolean;
}

const DISMISS_DISTANCE = 80;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/** Shared accessible drawer: compositor-thread WAAPI slide open/close, independent scroll from drag handle. */
export function BottomSheet({ title, onClose, children, suspended = false }: BottomSheetProps) {
  const titleId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const closingRef = useRef(false);
  const animsRef = useRef<Animation[]>([]);

  const cancelAnims = useCallback(() => {
    for (const anim of animsRef.current) anim.cancel();
    animsRef.current = [];
  }, []);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (prefersReducedMotion() || !panel || typeof panel.animate !== 'function') {
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
    const nextAnims: Animation[] = [panelAnim];
    if (backdrop && typeof backdrop.animate === 'function') {
      backdrop.style.opacity = '0';
      nextAnims.push(backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: SHEET_CLOSE_MS, easing: SHEET_CLOSE_EASE }));
    }
    animsRef.current = nextAnims;
    const finish = () => {
      closingRef.current = false;
      onClose();
    };
    void panelAnim.finished.then(finish, finish);
  }, [cancelAnims, onClose]);

  const swipe = useSwipeBack({ onBack: requestClose, enabled: !suspended });

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (prefersReducedMotion() || !panel || typeof panel.animate !== 'function') return undefined;
    cancelAnims();
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
    return () => cancelAnims();
  }, [cancelAnims]);

  useLayoutEffect(() => {
    if (suspended) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    return () => previous?.focus();
  }, [suspended]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (suspended) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      requestClose();
    }
    if (event.key !== 'Tab') return;
    const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [href], [tabindex="0"]');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={backdropRef}
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/50 will-change-[opacity]"
      onClick={event => { if (!suspended && event.target === event.currentTarget) requestClose(); }}
    >
      <div
        {...swipe}
        ref={panelRef}
        role="dialog"
        aria-modal={!suspended}
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        style={{ backfaceVisibility: 'hidden' }}
        className="ios-sheet flex max-h-[90%] min-h-0 flex-col rounded-t-[24px] bg-white text-[#111827] shadow-2xl will-change-transform"
      >
        <header
          className="shrink-0 px-4 pb-2 pt-3"
          style={{ touchAction: 'none' }}
          onPointerDown={event => {
            if (event.target instanceof Element && event.target.closest('button, a, input, select, textarea')) return;
            if (!suspended && event.button === 0 && contentRef.current?.scrollTop === 0) {
              dragStart.current = { x: event.clientX, y: event.clientY };
              event.currentTarget.setPointerCapture(event.pointerId);
            }
          }}
          onPointerCancel={() => { dragStart.current = null; }}
          onPointerUp={event => {
            const start = dragStart.current;
            dragStart.current = null;
            if (start && contentRef.current?.scrollTop === 0 && event.clientY - start.y >= DISMISS_DISTANCE && Math.abs(event.clientX - start.x) < event.clientY - start.y) {
              event.stopPropagation();
              requestClose();
            }
          }}
        >
          <div aria-hidden="true" className="mx-auto mb-2 h-[5px] w-9 rounded-full bg-[#E5E7EB]" />
          <div className="flex items-center justify-between gap-2">
            <h2 id={titleId} className="min-w-0 break-words text-xl font-semibold">{title}</h2>
            <button ref={closeRef} type="button" onClick={requestClose} aria-label={`Đóng ${title.toLocaleLowerCase('vi')}`} className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-[14px]">
              <IoClose aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
        </header>
        <div ref={contentRef} className="min-h-0 overflow-y-auto overscroll-contain px-4 pb-6" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

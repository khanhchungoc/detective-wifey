import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { NOTEBOOK_CLOSED_TRANSFORM, NOTEBOOK_SLIDE_EASING, NOTEBOOK_OPEN_DURATION_MS, NOTEBOOK_CLOSE_DURATION_MS, animateOverlay } from '../motion/anchoredOverlay';
import { useSwipeBack } from '../gestures/useSwipeBack';
import { useDialogFocus } from './useDialogFocus';

/** Keeps content pre-laid out and GPU-promoted off-screen so pulling or opening the notebook never triggers layout reflow or tile eviction. */
export function AnchoredOverlay({ open, anchorSelector, label, onClose, children }: {
  open: boolean; anchorSelector: string; label: string; onClose: () => void; children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | undefined>(undefined);
  const initialized = useRef(false);
  const onKeyDown = useDialogFocus(open, containerRef, onClose);
  const swipeHandlers = useSwipeBack({
    onBack: onClose,
    enabled: open,
    maxStartDistance: 44,
    onSwipeProgress: (progress) => {
      const screen = document.querySelector<HTMLElement>('[data-phone-screen]');
      if (screen) {
        screen.style.transition = 'none';
        const remainingProgress = Math.max(0, Math.min(1, 1 - progress));
        const scale = Number((1 - remainingProgress * 0.06).toFixed(4));
        screen.style.transform = `translate3d(0, 0, 0) scale(${scale})`;
        screen.style.borderRadius = `${Number((remainingProgress * 28).toFixed(1))}px`;
      }
    },
    onSwipeEnd: (committed) => {
      const screen = document.querySelector<HTMLElement>('[data-phone-screen]');
      if (screen) {
        screen.style.transition = `transform ${NOTEBOOK_CLOSE_DURATION_MS}ms ${NOTEBOOK_SLIDE_EASING}, border-radius ${NOTEBOOK_CLOSE_DURATION_MS}ms ${NOTEBOOK_SLIDE_EASING}`;
        if (committed) {
          screen.style.transform = 'translate3d(0, 0, 0) scale(1)';
          screen.style.borderRadius = '0px';
        } else {
          screen.style.transform = 'translate3d(0, 0, 0) scale(0.94)';
          screen.style.borderRadius = '28px';
        }
      }
    },
  });

  useLayoutEffect(() => {
    const screen = document.querySelector<HTMLElement>('[data-phone-screen]');
    if (screen) {
      screen.style.removeProperty('transition');
      screen.style.removeProperty('transform');
      screen.style.removeProperty('border-radius');
    }
    const drawer = drawerRef.current;
    if (!drawer) return;
    if (!open && !initialized.current) {
      drawer.style.opacity = '0';
      drawer.style.transform = NOTEBOOK_CLOSED_TRANSFORM;
      return;
    }
    drawer.style.visibility = 'visible';
    drawer.style.opacity = '1';
    const anchor = document.querySelector<HTMLElement>(anchorSelector);
    if (!initialized.current) {
      if (!drawer.style.transform || drawer.style.transform === 'none') {
        drawer.style.transform = NOTEBOOK_CLOSED_TRANSFORM;
      }
      initialized.current = true;
    }
    animation.current = animateOverlay(drawer, open, NOTEBOOK_CLOSED_TRANSFORM, () => {
      if (!open) {
        drawer.style.opacity = '0';
        initialized.current = false;
        anchor?.focus({ preventScroll: true });
      }
    }, animation.current, window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, [open, anchorSelector]);

  useEffect(() => () => animation.current?.cancel(), []);

  return (
    <div
      ref={containerRef}
      data-notebook-container
      data-open={open}
      inert={!open}
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
      aria-label={label}
      className="absolute inset-0 z-50 overflow-hidden pointer-events-none"
      onKeyDown={onKeyDown}
    >
      {/* Full-screen lower layer backdrop scrim (darkens entire phone screen underneath, tap anywhere outside notebook to close) */}
      <button
        type="button"
        data-notebook-backdrop
        data-notebook-shade="scrim"
        aria-label="Đóng sổ tay của vợ"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className="absolute inset-0 z-10 bg-slate-950/75 cursor-pointer"
        style={{
          opacity: open ? 1 : 0,
          transition: `opacity ${open ? `${NOTEBOOK_OPEN_DURATION_MS}ms` : `${NOTEBOOK_CLOSE_DURATION_MS}ms`} ${NOTEBOOK_SLIDE_EASING}`,
          pointerEvents: open ? 'auto' : 'none',
          willChange: 'opacity',
          backfaceVisibility: 'hidden',
        }}
      />

      {/* Fullscreen Evidence Board Details layer */}
      <div
        ref={drawerRef}
        data-notebook-overlay
        className="absolute inset-0 z-20 overflow-hidden bg-[#0E0A07]"
        style={{
          pointerEvents: open ? 'auto' : 'none',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          contain: 'layout paint style',
        }}
        {...swipeHandlers}
      >
        {children}
      </div>
    </div>
  );
}

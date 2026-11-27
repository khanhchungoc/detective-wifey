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
  const backdropRef = useRef<HTMLButtonElement>(null);
  const lastDisplacementRef = useRef(0);
  const animation = useRef<Animation | undefined>(undefined);
  const initialized = useRef(false);
  const onKeyDown = useDialogFocus(open, containerRef, onClose);
  const swipeHandlers = useSwipeBack({
    onBack: onClose,
    enabled: open,
    maxStartDistance: 44,
    onSwipeProgress: (progress, displacement) => {
      lastDisplacementRef.current = displacement;
      const backdrop = backdropRef.current;
      if (backdrop) {
        backdrop.style.transition = 'none';
        backdrop.style.opacity = String(Math.max(0, Math.min(1, 1 - progress)));
      }
      const screen = document.querySelector<HTMLElement>('[data-phone-screen]');
      if (screen) {
        screen.style.transition = 'none';
        const remainingProgress = Math.max(0, Math.min(1, 1 - progress));
        const scale = Number((1 - remainingProgress * 0.06).toFixed(4));
        screen.style.transform = `translate3d(0, 0, 0) scale(${scale})`;
      }
      const tab = document.querySelector<HTMLElement>(anchorSelector);
      if (tab) {
        const dockY = parseFloat(tab.dataset.dockY || '0') || 0;
        const tabWidth = tab.offsetWidth || 46;
        tab.style.transition = 'none';
        tab.style.opacity = '1';
        tab.style.transform = `translate3d(${Number((displacement - tabWidth).toFixed(2))}px, ${dockY}px, 0)`;
      }
    },
    onSwipeEnd: (committed) => {
      if (!committed) {
        lastDisplacementRef.current = 0;
      }
      const backdrop = backdropRef.current;
      if (backdrop) {
        backdrop.style.transition = `opacity ${NOTEBOOK_CLOSE_DURATION_MS}ms ${NOTEBOOK_SLIDE_EASING}`;
        backdrop.style.opacity = committed ? '0' : '1';
      }
      const screen = document.querySelector<HTMLElement>('[data-phone-screen]');
      if (screen) {
        screen.style.transition = `transform ${NOTEBOOK_CLOSE_DURATION_MS}ms ${NOTEBOOK_SLIDE_EASING}`;
        if (committed) {
          screen.style.transform = 'translate3d(0, 0, 0) scale(1)';
        } else {
          screen.style.transform = 'translate3d(0, 0, 0) scale(0.94)';
        }
      }
      const tab = document.querySelector<HTMLElement>(anchorSelector);
      if (tab && !committed) {
        const dockY = parseFloat(tab.dataset.dockY || '0') || 0;
        const tabWidth = tab.offsetWidth || 46;
        tab.style.transition = `transform ${NOTEBOOK_CLOSE_DURATION_MS}ms ${NOTEBOOK_SLIDE_EASING}, opacity ${NOTEBOOK_CLOSE_DURATION_MS}ms ${NOTEBOOK_SLIDE_EASING}`;
        tab.style.transform = `translate3d(${-tabWidth}px, ${dockY}px, 0)`;
        tab.style.opacity = '0';
      }
    },
  });

  useLayoutEffect(() => {
    const backdrop = backdropRef.current;
    if (backdrop) {
      backdrop.style.transition = `opacity ${open ? `${NOTEBOOK_OPEN_DURATION_MS}ms` : `${NOTEBOOK_CLOSE_DURATION_MS}ms`} ${NOTEBOOK_SLIDE_EASING}`;
      backdrop.style.opacity = open ? '1' : '0';
    }
    const screen = document.querySelector<HTMLElement>('[data-phone-screen]');
    if (screen) {
      screen.style.removeProperty('transition');
      screen.style.removeProperty('transform');
      screen.style.removeProperty('border-radius');
    }
    const drawer = drawerRef.current;
    if (!drawer) return;
    if (!open && !initialized.current) {
      lastDisplacementRef.current = 0;
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
    } else if (!open && lastDisplacementRef.current > 0) {
      // Preserve the finger's release position so closing continues smoothly instead of snapping back to 0px.
      drawer.style.transform = `translate3d(${lastDisplacementRef.current}px, 0, 0)`;
    }
    lastDisplacementRef.current = 0;
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
        ref={backdropRef}
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
        className="absolute inset-0 z-20 overflow-hidden bg-[#0E0A07] shadow-[-8px_0_28px_rgba(0,0,0,0.55)]"
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

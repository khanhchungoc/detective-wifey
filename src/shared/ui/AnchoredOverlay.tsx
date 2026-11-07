import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { NOTEBOOK_CLOSED_TRANSFORM, NOTEBOOK_OPEN_TRANSFORM, NOTEBOOK_SLIDE_EASING, NOTEBOOK_OPEN_DURATION_MS, NOTEBOOK_CLOSE_DURATION_MS, animateOverlay } from '../motion/anchoredOverlay';
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

  useLayoutEffect(() => {
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

      {/* Sliding notebook drawer on the upper layer */}
      <div
        ref={drawerRef}
        data-notebook-overlay
        className="absolute left-0 right-0 z-20 overflow-hidden rounded-l-2xl shadow-[10px_16px_28px_rgba(0,0,0,0.2),_4px_6px_12px_rgba(0,0,0,0.1)]"
        style={{
          top: 'calc(var(--phone-system-top, 59px) + 6px)',
          bottom: 'max(28px, var(--phone-system-bottom, 34px))',
          transform: open ? NOTEBOOK_OPEN_TRANSFORM : NOTEBOOK_CLOSED_TRANSFORM,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          contain: 'layout paint style',
        }}
      >
        {children}
      </div>
    </div>
  );
}

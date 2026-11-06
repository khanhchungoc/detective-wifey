import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { NOTEBOOK_CLOSED_TRANSFORM, animateOverlay } from '../motion/anchoredOverlay';
import { useDialogFocus } from './useDialogFocus';

/** Keeps content pre-laid out off-screen so pulling or opening the notebook never triggers layout reflow. */
export function AnchoredOverlay({ open, anchorSelector, label, onClose, children }: {
  open: boolean; anchorSelector: string; label: string; onClose: () => void; children: ReactNode;
}) {
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);
  const ref = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | undefined>(undefined);
  const initialized = useRef(false);
  const onKeyDown = useDialogFocus(open, ref, onClose);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!open && !initialized.current) {
      element.style.transform = NOTEBOOK_CLOSED_TRANSFORM;
      return;
    }
    element.style.visibility = 'visible';
    const anchor = document.querySelector<HTMLElement>(anchorSelector);
    if (!initialized.current) {
      if (!element.style.transform || element.style.transform === 'none') {
        element.style.transform = NOTEBOOK_CLOSED_TRANSFORM;
      }
      initialized.current = true;
    }
    animation.current = animateOverlay(element, open, NOTEBOOK_CLOSED_TRANSFORM, () => {
      if (!open) {
        element.style.visibility = 'hidden';
        setPresent(false);
        initialized.current = false;
        anchor?.focus({ preventScroll: true });
      }
    }, animation.current, window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, [open, anchorSelector]);
  useEffect(() => () => animation.current?.cancel(), []);
  return <div ref={ref} data-notebook-overlay inert={!open} role="dialog" aria-modal={open}
    aria-hidden={!open} aria-label={label} className="absolute inset-0 z-50 overflow-hidden"
    style={{
      visibility: open || present ? 'visible' : 'hidden',
      pointerEvents: open ? 'auto' : 'none',
    }}
    onKeyDown={onKeyDown}>{children}</div>;
}

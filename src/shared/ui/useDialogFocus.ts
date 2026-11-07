import { useEffect, type KeyboardEvent, type RefObject } from 'react';

export function useDialogFocus(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const focusFirst = () => {
      const scope = ref.current?.querySelector<HTMLElement>('[role="dialog"][aria-modal="true"]') ?? ref.current;
      scope?.querySelector<HTMLElement>('button:not(:disabled), [tabindex="0"]')?.focus({ preventScroll: true });
    };
    if (typeof requestAnimationFrame === 'function') {
      const id = requestAnimationFrame(focusFirst);
      return () => cancelAnimationFrame(id);
    }
    focusFirst();
  }, [open, ref]);
  return (event: KeyboardEvent) => {
    if (!open) return;
    if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
    if (event.key !== 'Tab') return;
    const buttons = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, textarea, [tabindex="0"]') ?? [])
      .filter(item => item.getClientRects().length > 0);
    if (!buttons.length) return;
    const index = buttons.indexOf(document.activeElement as HTMLElement);
    event.preventDefault();
    buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
  };
}

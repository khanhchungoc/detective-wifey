import { useLayoutEffect, useRef } from 'react';
import { IoBookOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { NOTEBOOK_CLOSED_TRANSFORM, animateOverlay } from '../../shared/motion/anchoredOverlay';
import {
  clampFloatingPoint, floatingDockPosition, floatingVelocity, isFloatingDrag, projectFloatingDock,
  notebookPullOffset, shouldCommitNotebookPull,
  FLOATING_SAMPLE_MS, FLOATING_SETTLE_MS,
  NOTEBOOK_TAB_WIDTH, NOTEBOOK_TAB_HEIGHT, NOTEBOOK_FLOAT_SIZE,
  type FloatingBounds, type FloatingPoint, type FloatingSample,
} from './floatingControlPosition';

const transform = (point: FloatingPoint) => `translate3d(${point.x}px, ${point.y}px, 0)`;

export function NotebookTab({
  open,
  hidden = false,
  onOpen,
  onClose,
}: {
  open: boolean;
  hidden?: boolean;
  onOpen: () => void;
  onClose?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const position = useRef<{ fraction: number }>({ fraction: .68 });
  const bounds = useRef<FloatingBounds>({ left: 0, right: 0, top: 0, bottom: 0 });
  const settling = useRef<Animation | null>(null);
  const frame = useRef<number | null>(null);
  const gesture = useRef<{
    id: number; startX: number; startY: number; origin: FloatingPoint; point: FloatingPoint;
    scaleX: number; scaleY: number; moved: boolean; mode: 'vertical' | 'pull' | null;
    surfaceWidth: number; pullOffsetX: number; overlay: HTMLElement | null; samples: FloatingSample[];
  } | null>(null);
  const suppressClick = useRef(false);

  useLayoutEffect(() => {
    const element = ref.current;
    const parent = element?.offsetParent as HTMLElement | null;
    if (!element || !parent) return;
    const place = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      if (gesture.current) suppressClick.current = true;
      gesture.current = null;
      settling.current?.cancel();
      const style = getComputedStyle(parent);
      const scaleY = parent.getBoundingClientRect().height / parent.offsetHeight || 1;
      const statusHeight = (parent.querySelector('.phone-system-status')?.getBoundingClientRect().height ?? 0) / scaleY;
      const left = parseFloat(style.paddingLeft) || 0;
      const top = Math.max(59, statusHeight, parseFloat(style.paddingTop) || 0) + 8;
      bounds.current = { left, right: Math.max(left, parent.clientWidth - NOTEBOOK_TAB_WIDTH - (parseFloat(style.paddingRight) || 0)), top,
        bottom: Math.max(top, parent.clientHeight - NOTEBOOK_TAB_HEIGHT - Math.max(34, parseFloat(style.paddingBottom) || 0) - 8) };
      element.style.transform = transform(floatingDockPosition('right', position.current.fraction, bounds.current));
      element.dataset.edge = 'right';
      element.dataset.floating = 'false';
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(parent);
    return () => {
      observer.disconnect();
      settling.current?.cancel();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  const finish = (event: React.PointerEvent<HTMLButtonElement>) => {
    const active = gesture.current;
    if (!active || active.id !== event.pointerId) return;
    gesture.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    const dx = (event.clientX - active.startX) / active.scaleX;
    const dy = (event.clientY - active.startY) / active.scaleY;
    const cancelled = event.type !== 'pointerup';
    active.moved ||= isFloatingDrag(dx, dy);
    suppressClick.current = active.moved || cancelled;
    if (!active.moved && !cancelled) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const velocity = floatingVelocity(active.samples, { x: event.clientX / active.scaleX, y: event.clientY / active.scaleY, time: event.timeStamp });
    const button = event.currentTarget;
    const from = getComputedStyle(button).transform;
    settling.current?.cancel();
    button.dataset.edge = 'right';
    button.dataset.floating = 'false';

    if (active.mode === 'pull') {
      const dockPoint = floatingDockPosition('right', position.current.fraction, bounds.current);
      const to = transform(dockPoint);
      button.style.transform = to;
      if (!reduced && button.animate) settling.current = button.animate([{ transform: from }, { transform: to }],
        { duration: FLOATING_SETTLE_MS, easing: 'cubic-bezier(.32,.72,0,1)' });
      const offsetX = notebookPullOffset(active.surfaceWidth, dx, open);
      const shouldOpen = !cancelled && shouldCommitNotebookPull(offsetX, active.surfaceWidth, velocity.x, open);
      if (shouldOpen && !open) {
        onOpen();
      } else if (!shouldOpen && open) {
        onClose?.();
      } else if (!shouldOpen && !open && active.overlay) {
        const overlay = active.overlay;
        animateOverlay(overlay, false, NOTEBOOK_CLOSED_TRANSFORM, () => {
          overlay.style.visibility = 'hidden';
        }, undefined, reduced);
      }
      return;
    }

    const point = cancelled ? active.point : clampFloatingPoint({ x: bounds.current.right, y: active.origin.y + dy }, bounds.current);
    const dock = projectFloatingDock(point, velocity, bounds.current, !cancelled && !reduced);
    position.current = { fraction: dock.fraction };
    const to = transform(dock.point);
    button.style.transform = to;
    if (!reduced && button.animate) settling.current = button.animate([{ transform: from }, { transform: to }],
      { duration: FLOATING_SETTLE_MS, easing: 'cubic-bezier(.32,.72,0,1)' });
  };

  return <button ref={ref} data-notebook-tab data-edge="right" data-floating="false" type="button"
    aria-label={open ? 'Đóng sổ tay của vợ' : 'Mở sổ tay của vợ'}
    aria-haspopup="dialog" aria-expanded={open} tabIndex={hidden ? -1 : 0} aria-hidden={hidden}
    title={open ? 'Sổ tay của vợ · Chạm để đóng, kéo dọc để di chuyển' : 'Sổ tay của vợ · Chạm hoặc kéo sang trái để mở, kéo dọc để di chuyển'}
    className="group absolute left-0 top-0 z-[80] flex cursor-grab items-center justify-center text-white before:absolute before:inset-y-0 before:-left-4 before:right-0 active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
    style={{ width: NOTEBOOK_TAB_WIDTH, height: NOTEBOOK_TAB_HEIGHT, touchAction: 'none', opacity: hidden ? 0 : 1, pointerEvents: hidden ? 'none' : 'auto' }}
    onPointerDown={event => {
      if (event.button !== 0 || !event.isPrimary) return;
      event.stopPropagation();
      const button = event.currentTarget;
      const parent = button.offsetParent as HTMLElement | null;
      if (!parent) return;
      const rect = button.getBoundingClientRect(), host = parent.getBoundingClientRect();
      const scaleX = host.width / parent.offsetWidth || 1, scaleY = host.height / parent.offsetHeight || 1;
      const surfaceWidth = parent.offsetWidth || host.width || 390;
      if (bounds.current.right === 0 && surfaceWidth > 0) {
        bounds.current = { left: 0, right: Math.max(0, surfaceWidth - NOTEBOOK_TAB_WIDTH), top: 67, bottom: Math.max(67, (parent.offsetHeight || host.height || 844) - NOTEBOOK_TAB_HEIGHT - 42) };
      }
      const point = { x: (rect.left - host.left) / scaleX - parent.clientLeft, y: (rect.top - host.top) / scaleY - parent.clientTop };
      const overlay = typeof parent.querySelector === 'function' ? parent.querySelector<HTMLElement>('[data-notebook-overlay]') : null;
      settling.current?.cancel();
      button.style.transform = transform(point);
      gesture.current = {
        id: event.pointerId, startX: event.clientX, startY: event.clientY, origin: point, point,
        scaleX, scaleY, moved: false, mode: null, surfaceWidth, pullOffsetX: open ? 0 : surfaceWidth, overlay,
        samples: [{ x: event.clientX / scaleX, y: event.clientY / scaleY, time: event.timeStamp }],
      };
      suppressClick.current = false;
      button.setPointerCapture(event.pointerId);
    }}
    onPointerMove={event => {
      const active = gesture.current;
      if (!active || active.id !== event.pointerId) return;
      const dx = (event.clientX - active.startX) / active.scaleX, dy = (event.clientY - active.startY) / active.scaleY;
      active.samples = active.samples.filter(sample => event.timeStamp - sample.time <= FLOATING_SAMPLE_MS);
      active.samples.push({ x: event.clientX / active.scaleX, y: event.clientY / active.scaleY, time: event.timeStamp });
      active.moved ||= isFloatingDrag(dx, dy);
      if (!active.moved) return;
      if (active.mode === null) {
        const isHorizontalPull = Math.abs(dx) >= Math.abs(dy) && (open ? dx > 0 : dx < 0);
        active.mode = isHorizontalPull ? 'pull' : 'vertical';
        if (active.mode === 'pull' && active.overlay) {
          active.overlay.getAnimations?.().forEach(anim => anim.cancel());
          active.overlay.style.visibility = 'visible';
          active.overlay.style.opacity = '1';
        }
      }
      if (active.mode === 'pull') {
        active.pullOffsetX = notebookPullOffset(active.surfaceWidth, dx, open);
        const tabX = open ? bounds.current.right : clampFloatingPoint({ x: active.origin.x + dx, y: active.origin.y }, bounds.current).x;
        active.point = { x: tabX, y: active.origin.y };
      } else {
        active.point = clampFloatingPoint({ x: bounds.current.right, y: active.origin.y + dy }, bounds.current);
      }
      if (frame.current === null) frame.current = requestAnimationFrame(() => {
        frame.current = null;
        if (gesture.current !== active) return;
        if (ref.current) ref.current.style.transform = transform(active.point);
        if (active.mode === 'pull' && active.overlay) {
          active.overlay.style.transform = `translate3d(${Math.round(active.pullOffsetX)}px, 0, 0)`;
        }
      });
    }} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}
    onClick={event => {
      event.stopPropagation();
      if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; }
      settling.current?.cancel();
      event.currentTarget.style.transform = transform(floatingDockPosition('right', position.current.fraction, bounds.current));
      event.currentTarget.dataset.floating = 'false';
      if (open) {
        onClose?.();
      } else {
        onOpen();
      }
    }}>
      <span data-tab-surface aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 flex h-[var(--tab-dock-height)] w-[var(--tab-dock-width)] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-l-2xl border-y border-l border-white/35 bg-slate-900/85 shadow-lg"
        style={{ '--tab-dock-width': `${NOTEBOOK_TAB_WIDTH}px`, '--tab-dock-height': `${NOTEBOOK_TAB_HEIGHT}px`, '--tab-float-size': `${NOTEBOOK_FLOAT_SIZE}px`,
        } as React.CSSProperties}>
        {open ? (
          <IoChevronForwardOutline className="h-4 w-4" />
        ) : (
          <IoBookOutline className="h-4 w-4" />
        )}
      </span>
    </button>;
}

import { useLayoutEffect, useRef } from 'react';
import { IoEaselOutline } from 'react-icons/io5';
import { NOTEBOOK_SLIDE_EASING } from '../../shared/motion/anchoredOverlay';
import {
  clampFloatingPoint, floatingDockPosition, floatingVelocity, isFloatingDrag, projectFloatingDock,
  FLOATING_SAMPLE_MS, FLOATING_SETTLE_MS,
  NOTEBOOK_TAB_WIDTH, NOTEBOOK_TAB_HEIGHT,
  type FloatingBounds, type FloatingPoint, type FloatingSample,
} from './floatingControlPosition';

const transform = (point: FloatingPoint) => `translate3d(${point.x}px, ${point.y}px, 0)`;
const OVERLAY_EDGE_INSET = 12;
const OVERLAY_BOTTOM_CLEARANCE = 74;

export function NotebookTab({
  open,
  hidden = false,
  evidenceCount = 0,
  caseNumber = 1,
  onOpen,
  onClose,
}: {
  open: boolean;
  hidden?: boolean;
  evidenceCount?: number;
  caseNumber?: number;
  onOpen: () => void;
  onClose?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const position = useRef<{ fraction: number }>({ fraction: 1 });
  const bounds = useRef<FloatingBounds>({ left: 0, right: 0, top: 0, bottom: 0 });
  const settling = useRef<Animation | null>(null);
  const frame = useRef<number | null>(null);
  const gesture = useRef<{
    id: number; startX: number; startY: number; origin: FloatingPoint; point: FloatingPoint;
    scaleX: number; scaleY: number; moved: boolean;
    samples: FloatingSample[];
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
      const left = (parseFloat(style.paddingLeft) || 0) + OVERLAY_EDGE_INSET;
      const top = Math.max(59, statusHeight, parseFloat(style.paddingTop) || 0) + 8;
      const right = Math.max(left, parent.clientWidth - NOTEBOOK_TAB_WIDTH - (parseFloat(style.paddingRight) || 0) - OVERLAY_EDGE_INSET);
      const bottom = Math.max(top, parent.clientHeight - NOTEBOOK_TAB_HEIGHT - Math.max(34, parseFloat(style.paddingBottom) || 0) - OVERLAY_BOTTOM_CLEARANCE);
      bounds.current = { left, right, top, bottom };
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
    const from = transform(active.point);
    settling.current?.cancel();
    button.dataset.floating = 'false';

    const point = cancelled ? active.point : clampFloatingPoint({ x: bounds.current.right, y: active.origin.y + dy }, bounds.current);
    const dock = projectFloatingDock(point, velocity, bounds.current, !cancelled && !reduced);
    position.current = { fraction: dock.fraction };
    const to = transform(floatingDockPosition('right', dock.fraction, bounds.current));
    button.dataset.edge = 'right';
    button.style.transform = to;
    if (!reduced && button.animate) {
      settling.current = button.animate([{ transform: from }, { transform: to }],
        { duration: FLOATING_SETTLE_MS, easing: NOTEBOOK_SLIDE_EASING });
    }
  };

  const formattedCase = String(Math.max(1, caseNumber)).padStart(2, '0');
  const isDisabled = hidden || open;

  return (
    <button
      ref={ref}
      data-notebook-tab
      data-edge="right"
      data-floating="false"
      type="button"
      aria-label={open ? 'Đóng bảng manh mối' : `Mở bảng manh mối (${evidenceCount} manh mối)`}
      aria-haspopup="dialog"
      aria-expanded={open}
      tabIndex={isDisabled ? -1 : 0}
      aria-hidden={isDisabled}
      title="Sổ tay điều tra - Chạm để mở bảng manh mối, kéo dọc để di chuyển"
      className="group absolute left-0 top-0 z-[80] flex cursor-grab items-center justify-center text-white active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 transition-opacity duration-200"
      style={{
        width: NOTEBOOK_TAB_WIDTH,
        height: NOTEBOOK_TAB_HEIGHT,
        touchAction: 'none',
        opacity: isDisabled ? 0 : 1,
        pointerEvents: isDisabled ? 'none' : 'auto',
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
      }}
      onPointerDown={event => {
        if (event.button !== 0 || !event.isPrimary) return;
        event.stopPropagation();
        const button = event.currentTarget;
        const parent = button.offsetParent as HTMLElement | null;
        if (!parent) return;
        const rect = button.getBoundingClientRect(), host = parent.getBoundingClientRect();
        const scaleX = host.width / parent.offsetWidth || 1, scaleY = host.height / parent.offsetHeight || 1;
        const surfaceWidth = parent.offsetWidth || host.width || 390;
        const surfaceHeight = parent.offsetHeight || host.height || 844;
        if (bounds.current.right === 0 && surfaceWidth > 0) {
          bounds.current = {
            left: OVERLAY_EDGE_INSET,
            right: Math.max(OVERLAY_EDGE_INSET, surfaceWidth - NOTEBOOK_TAB_WIDTH - OVERLAY_EDGE_INSET),
            top: 67,
            bottom: Math.max(67, surfaceHeight - NOTEBOOK_TAB_HEIGHT - OVERLAY_BOTTOM_CLEARANCE),
          };
        }
        const point = { x: (rect.left - host.left) / scaleX - parent.clientLeft, y: (rect.top - host.top) / scaleY - parent.clientTop };
        settling.current?.cancel();
        button.style.transform = transform(point);
        gesture.current = {
          id: event.pointerId, startX: event.clientX, startY: event.clientY, origin: point, point,
          scaleX, scaleY, moved: false,
          samples: [{ x: event.clientX / scaleX, y: event.clientY / scaleY, time: event.timeStamp }],
        };
        suppressClick.current = false;
        try { button.setPointerCapture(event.pointerId); } catch { /* synthetic pointer */ }
      }}
      onPointerMove={event => {
        const active = gesture.current;
        if (!active || active.id !== event.pointerId) return;
        event.stopPropagation?.();
        const dx = (event.clientX - active.startX) / active.scaleX, dy = (event.clientY - active.startY) / active.scaleY;
        active.samples = active.samples.filter(sample => event.timeStamp - sample.time <= FLOATING_SAMPLE_MS);
        active.samples.push({ x: event.clientX / active.scaleX, y: event.clientY / active.scaleY, time: event.timeStamp });
        active.moved ||= isFloatingDrag(dx, dy);
        if (!active.moved) return;
        event.currentTarget.dataset.floating = 'true';
        active.point = clampFloatingPoint({ x: bounds.current.right, y: active.origin.y + dy }, bounds.current);
        if (ref.current) ref.current.style.transform = transform(active.point);
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
      onLostPointerCapture={finish}
      onClick={event => {
        event.stopPropagation();
        if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; }
        settling.current?.cancel();
        event.currentTarget.dataset.edge = 'right';
        event.currentTarget.dataset.floating = 'false';
        if (open) onClose?.();
        else onOpen();
      }}
    >
      <span
        data-tab-surface
        aria-hidden="true"
        className="pointer-events-none flex h-full w-full items-center justify-between gap-2.5 rounded-[24px] border border-white/15 bg-[#141210] px-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform duration-150 group-active:scale-95"
      >
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center">
          <IoEaselOutline className="h-[22px] w-[22px] text-[#F5EFE6]" />
          <span
            data-evidence-badge
            className={`absolute -right-1 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none tabular-nums ring-2 ring-[#151210] ${
              evidenceCount > 0 ? 'bg-[#EF4444] text-white' : 'bg-stone-700 text-stone-200'
            }`}
          >
            {evidenceCount}
          </span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col items-center justify-center">
          <span className="text-[8.5px] font-semibold uppercase tracking-[0.14em] text-[#A89A8A] leading-none">
            VỤ ÁN
          </span>
          <span className="mt-0.5 font-mono text-[17px] font-bold leading-none tracking-tight text-white tabular-nums">
            {formattedCase}
          </span>
          <span className="mt-1 h-[2.5px] w-4 rounded-full bg-[#EF4444]" />
        </span>
      </span>
    </button>
  );
}

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { animate, useMotionValue } from 'motion/react';
import type { AnimationPlaybackControls, MotionValue } from 'motion/react';
import {
  DRAG_START_PX,
  applyRubberBand,
  clampPageIndex,
  resolvePagerTarget,
} from './pagerLogic';

const PAGER_SPRING = { type: 'spring' as const, stiffness: 320, damping: 34, mass: 0.9 };
const REDUCED_FADE = { duration: 0.15, ease: 'easeOut' as const };

export interface PagerHandlers {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
}

export interface Pager {
  /** Fractional page position (0 = first page). Updated per frame without React renders. */
  pos: MotionValue<number>;
  goTo: (index: number) => void;
  handlers: PagerHandlers;
  /** True when the last pointer gesture was a drag, so the following click must be ignored. */
  consumeDragClick: () => boolean;
  surfaceRef: RefObject<HTMLDivElement | null>;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  startPos: number;
  lastX: number;
  lastT: number;
  velocityX: number;
  dragging: boolean;
}

/**
 * Horizontal drag-follow pager. The finger drives `pos` directly (no React renders while
 * dragging, no layout reads); release springs to the nearest page. Reduced motion skips
 * drag-follow and only fades between pages.
 */
export function usePager(params: {
  index: number;
  total: number;
  reduced: boolean;
  /** Page stride as a fraction of the surface width. */
  strideRatio?: number;
  onIndexChange: (index: number) => void;
}): Pager {
  const { index, total, reduced, strideRatio = 0.62, onIndexChange } = params;
  const pos = useMotionValue(index);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const widthRef = useRef(0);
  const dragRef = useRef<DragState | null>(null);
  const draggedRef = useRef(false);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const targetRef = useRef(index);
  const onChangeRef = useRef(onIndexChange);

  useEffect(() => {
    onChangeRef.current = onIndexChange;
  }, [onIndexChange]);

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver((entries) => {
      widthRef.current = entries[0]?.contentRect.width ?? 0;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const settle = useCallback(
    (target: number, velocity = 0) => {
      controlsRef.current?.stop();
      targetRef.current = target;
      controlsRef.current = animate(
        pos,
        target,
        reduced ? REDUCED_FADE : { ...PAGER_SPRING, velocity },
      );
    },
    [pos, reduced],
  );

  // External index changes (dots, tabs, arrows) animate here; drag releases already set targetRef.
  useEffect(() => {
    if (targetRef.current !== index) settle(index);
  }, [index, settle]);

  useEffect(() => () => controlsRef.current?.stop(), []);

  const stride = useCallback(() => widthRef.current * strideRatio, [strideRatio]);

  const handlers = useMemo<PagerHandlers>(
    () => ({
      onPointerDown: (e) => {
        if (total <= 1 || !e.isPrimary) return;
        controlsRef.current?.stop();
        draggedRef.current = false;
        dragRef.current = {
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          startPos: pos.get(),
          lastX: e.clientX,
          lastT: e.timeStamp,
          velocityX: 0,
          dragging: false,
        };
      },
      onPointerMove: (e) => {
        const d = dragRef.current;
        if (!d || d.pointerId !== e.pointerId) return;
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        if (!d.dragging) {
          if (Math.abs(dx) < DRAG_START_PX || Math.abs(dx) <= Math.abs(dy)) return;
          d.dragging = true;
          draggedRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
        }
        const dt = Math.max(1, e.timeStamp - d.lastT);
        const instant = ((e.clientX - d.lastX) / dt) * 1000;
        d.velocityX = d.velocityX * 0.6 + instant * 0.4;
        d.lastX = e.clientX;
        d.lastT = e.timeStamp;
        if (reduced) return;
        const s = stride();
        if (s > 0) pos.set(applyRubberBand(d.startPos - dx / s, total));
      },
      onPointerUp: (e) => {
        const d = dragRef.current;
        dragRef.current = null;
        if (!d || d.pointerId !== e.pointerId) return;
        if (!d.dragging) {
          settle(clampPageIndex(Math.round(pos.get()), total));
          return;
        }
        const s = stride();
        const target = resolvePagerTarget({
          baseIndex: Math.round(d.startPos),
          dx: e.clientX - d.startX,
          velocityX: d.velocityX,
          stridePx: s,
          total,
        });
        settle(target, s > 0 ? -d.velocityX / s : 0);
        if (target !== index) onChangeRef.current(target);
      },
      onPointerCancel: (e) => {
        const d = dragRef.current;
        dragRef.current = null;
        if (!d || d.pointerId !== e.pointerId) return;
        settle(clampPageIndex(Math.round(d.startPos), total));
      },
    }),
    [index, pos, reduced, settle, stride, total],
  );

  const consumeDragClick = useCallback(() => {
    const wasDrag = draggedRef.current;
    draggedRef.current = false;
    return wasDrag;
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const clamped = clampPageIndex(next, total);
      if (clamped === index) return;
      onChangeRef.current(clamped);
    },
    [index, total],
  );

  return { pos, goTo, handlers, consumeDragClick, surfaceRef };
}

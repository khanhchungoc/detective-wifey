import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import {
  DRAG_START_PX,
  applyRubberBand,
  clampPageIndex,
  resolvePagerTarget,
} from './pagerLogic';

const PAGER_DURATION_MS = 520;
const PAGER_REDUCED_MS = 180;
const PAGER_EASE = 'cubic-bezier(0.45, 0, 0.25, 1)';

/** Horizontal offset between adjacent folder slots as a percentage of stage width. */
export const HUSBAND_SLOT_PCT = 88;

export interface PagerHandlers {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
}

export interface Pager {
  /** Single horizontal track moved on the GPU compositor thread via native WAAPI. */
  trackRef: RefObject<HTMLDivElement | null>;
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

const trackTransform = (pos: number) => `translate3d(${(-pos * HUSBAND_SLOT_PCT).toFixed(3)}%, 0px, 0px)`;

/**
 * Horizontal compositor-thread pager. Moves a single track container with `translate3d` via
 * native WAAPI (zero JS rAF loop, zero per-card scale/3D re-rasterization) for 120Hz Android.
 */
export function usePager(params: {
  index: number;
  total: number;
  reduced: boolean;
  /** Page stride as a fraction of the surface width. */
  strideRatio?: number;
  onIndexChange: (index: number) => void;
}): Pager {
  const { index, total, reduced, strideRatio = HUSBAND_SLOT_PCT / 100, onIndexChange } = params;
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const widthRef = useRef(0);
  const currentPosRef = useRef(index);
  const targetRef = useRef(index);
  const activeAnimRef = useRef<Animation | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const draggedRef = useRef(false);
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

  const cancelAnim = useCallback(() => {
    if (activeAnimRef.current) {
      activeAnimRef.current.cancel();
      activeAnimRef.current = null;
    }
  }, []);

  const settle = useCallback(
    (target: number) => {
      cancelAnim();
      const fromPos = currentPosRef.current;
      targetRef.current = target;
      currentPosRef.current = target;
      const track = trackRef.current;
      if (!track) return;

      const endTransform = trackTransform(target);
      track.style.transform = endTransform;

      if (fromPos === target || typeof track.animate !== 'function') return;

      if (reduced) {
        activeAnimRef.current = track.animate([{ opacity: 0.5 }, { opacity: 1 }], {
          duration: PAGER_REDUCED_MS,
          easing: 'ease-in-out',
        });
        return;
      }

      activeAnimRef.current = track.animate(
        [{ transform: trackTransform(fromPos) }, { transform: endTransform }],
        { duration: PAGER_DURATION_MS, easing: PAGER_EASE },
      );
    },
    [cancelAnim, reduced],
  );

  // External index changes (dots, arrows, side-card taps) animate here.
  useEffect(() => {
    if (targetRef.current !== index) settle(index);
  }, [index, settle]);

  useEffect(() => () => cancelAnim(), [cancelAnim]);

  const stride = useCallback(() => widthRef.current * strideRatio, [strideRatio]);

  const handlers = useMemo<PagerHandlers>(
    () => ({
      onPointerDown: (e) => {
        if (total <= 1 || !e.isPrimary) return;
        cancelAnim();
        draggedRef.current = false;
        dragRef.current = {
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          startPos: currentPosRef.current,
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
        if (s > 0 && trackRef.current) {
          const nextPos = applyRubberBand(d.startPos - dx / s, total);
          currentPosRef.current = nextPos;
          trackRef.current.style.transform = trackTransform(nextPos);
        }
      },
      onPointerUp: (e) => {
        const d = dragRef.current;
        dragRef.current = null;
        if (!d || d.pointerId !== e.pointerId) return;
        if (!d.dragging) {
          settle(clampPageIndex(Math.round(currentPosRef.current), total));
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
        settle(target);
        if (target !== index) onChangeRef.current(target);
      },
      onPointerCancel: (e) => {
        const d = dragRef.current;
        dragRef.current = null;
        if (!d || d.pointerId !== e.pointerId) return;
        settle(clampPageIndex(Math.round(d.startPos), total));
      },
    }),
    [cancelAnim, index, reduced, settle, stride, total],
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

  return { trackRef, goTo, handlers, consumeDragClick, surfaceRef };
}

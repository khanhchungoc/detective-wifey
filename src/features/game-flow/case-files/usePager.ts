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

/** Horizontal offset between adjacent folders as a percentage of card width. */
const SLOT_PCT = 88;
const MAX_ROTATE_Y_DEG = 52;
const ROTATE_Y_PER_SLOT = 34;
const SCALE_DROP_PER_SLOT = 0.13;

export interface PagerHandlers {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
}

export interface Pager {
  /** Ref callback to attach each folder card for compositor-thread 3D WAAPI transitions. */
  registerCard: (index: number) => (el: HTMLDivElement | null) => void;
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

/** Pure 3D cover-flow transform for a card at `offset = cardIndex - pagerPos`. */
export function husbandCardTransform(offset: number, reduced: boolean): string {
  if (reduced) return 'translate3d(0%, 0px, 0px)';
  const xPct = offset * SLOT_PCT;
  const rotY = Math.max(-MAX_ROTATE_Y_DEG, Math.min(MAX_ROTATE_Y_DEG, -offset * ROTATE_Y_PER_SLOT));
  const scale = 1 - Math.min(Math.abs(offset), 1.4) * SCALE_DROP_PER_SLOT;
  return `perspective(1100px) translate3d(${xPct.toFixed(2)}%, 0px, 0px) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
}

export function husbandCardOpacity(offset: number, reduced: boolean): number {
  const abs = Math.abs(offset);
  if (reduced) return abs < 0.5 ? 1 : 0;
  return Math.max(0, 1 - Math.max(0, abs - 1) * 1.2);
}

export function husbandCardZIndex(offset: number): number {
  return 20 - Math.round(Math.abs(offset) * 5);
}

/**
 * 3D cover-flow pager driven by native compositor-thread WAAPI (`element.animate`).
 * Zero JS rAF loops during transitions; pointer drags update `style.transform` directly.
 */
export function usePager(params: {
  index: number;
  total: number;
  reduced: boolean;
  /** Page stride as a fraction of the surface width. */
  strideRatio?: number;
  onIndexChange: (index: number) => void;
}): Pager {
  const { index, total, reduced, strideRatio = 0.69, onIndexChange } = params;
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const cardElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const widthRef = useRef(0);
  const currentPosRef = useRef(index);
  const targetRef = useRef(index);
  const activeAnimsRef = useRef<Animation[]>([]);
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

  const cancelAnims = useCallback(() => {
    for (const anim of activeAnimsRef.current) {
      anim.cancel();
    }
    activeAnimsRef.current = [];
  }, []);

  const applyPos = useCallback(
    (pos: number) => {
      for (let i = 0; i < cardElsRef.current.length; i += 1) {
        const el = cardElsRef.current[i];
        if (!el) continue;
        const offset = i - pos;
        el.style.transform = husbandCardTransform(offset, reduced);
        el.style.opacity = String(husbandCardOpacity(offset, reduced));
        el.style.zIndex = String(husbandCardZIndex(offset));
      }
    },
    [reduced],
  );

  const settle = useCallback(
    (target: number) => {
      cancelAnims();
      const fromPos = currentPosRef.current;
      targetRef.current = target;
      currentPosRef.current = target;

      for (let i = 0; i < cardElsRef.current.length; i += 1) {
        const el = cardElsRef.current[i];
        if (!el) continue;
        const fromOffset = i - fromPos;
        const toOffset = i - target;
        const endTransform = husbandCardTransform(toOffset, reduced);
        const endOpacity = husbandCardOpacity(toOffset, reduced);

        el.style.transform = endTransform;
        el.style.opacity = String(endOpacity);
        el.style.zIndex = String(husbandCardZIndex(toOffset));

        if (fromPos === target || typeof el.animate !== 'function') continue;

        // Skip animating cards completely off-screen at both ends.
        if (Math.abs(fromOffset) > 1.6 && Math.abs(toOffset) > 1.6) continue;

        const anim = reduced
          ? el.animate(
              [{ opacity: husbandCardOpacity(fromOffset, true) }, { opacity: endOpacity }],
              { duration: PAGER_REDUCED_MS, easing: 'ease-in-out' },
            )
          : el.animate(
              [
                {
                  transform: husbandCardTransform(fromOffset, false),
                  opacity: husbandCardOpacity(fromOffset, false),
                },
                {
                  transform: endTransform,
                  opacity: endOpacity,
                },
              ],
              { duration: PAGER_DURATION_MS, easing: PAGER_EASE },
            );
        activeAnimsRef.current.push(anim);
      }
    },
    [cancelAnims, reduced],
  );

  useEffect(() => {
    if (targetRef.current !== index) settle(index);
  }, [index, settle]);

  useEffect(() => () => cancelAnims(), [cancelAnims]);

  const registerCard = useCallback(
    (cardIdx: number) => (el: HTMLDivElement | null) => {
      cardElsRef.current[cardIdx] = el;
    },
    [],
  );

  const stride = useCallback(() => widthRef.current * strideRatio, [strideRatio]);

  const handlers = useMemo<PagerHandlers>(
    () => ({
      onPointerDown: (e) => {
        if (total <= 1 || !e.isPrimary) return;
        cancelAnims();
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
        if (s > 0) {
          const nextPos = applyRubberBand(d.startPos - dx / s, total);
          currentPosRef.current = nextPos;
          applyPos(nextPos);
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
    [applyPos, cancelAnims, index, reduced, settle, stride, total],
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

  return { registerCard, goTo, handlers, consumeDragClick, surfaceRef };
}

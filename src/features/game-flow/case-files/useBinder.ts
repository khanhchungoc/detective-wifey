import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { animate, motionValue } from 'motion/react';
import type { AnimationPlaybackControls, MotionValue } from 'motion/react';
import {
  DRAG_START_PX,
  SHEET_FLIP_STAGGER_S,
  clampPageIndex,
  planSheetFlips,
  resolvePagerTarget,
} from './pagerLogic';
import type { PagerHandlers } from './usePager';

const FLIP_TWEEN = { duration: 0.42, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] };
const REDUCED_FADE = { duration: 0.15, ease: 'easeOut' as const };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export interface Binder {
  /** One 0..1 value per sheet: 0 = on the stack, 1 = turned over. Updated without React renders. */
  flips: MotionValue<number>[];
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
  base: number;
  lastX: number;
  lastT: number;
  velocityX: number;
  dragging: boolean;
}

/**
 * Binder of sheets: sheet i is turned over (flip 1) when i < current index. A tab tap turns every
 * sheet between the current and target index one after another; a swipe turns one sheet with
 * drag-follow. Reduced motion skips drag-follow and stagger and only fades.
 */
export function useBinder(params: {
  index: number;
  total: number;
  reduced: boolean;
  /** Distance, as a fraction of the surface width, that fully turns one sheet. */
  strideRatio?: number;
  onIndexChange: (index: number) => void;
}): Binder {
  const { index, total, reduced, strideRatio = 0.7, onIndexChange } = params;
  const [flips] = useState(() => Array.from({ length: total }, (_, i) => motionValue(i < index ? 1 : 0)));
  const controlsRef = useRef<(AnimationPlaybackControls | undefined)[]>([]);
  const logicalIndexRef = useRef(index);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const widthRef = useRef(0);
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

  const flipSheet = useCallback(
    (sheet: number, flipped: boolean, order: number) => {
      controlsRef.current[sheet]?.stop();
      controlsRef.current[sheet] = animate(
        flips[sheet],
        flipped ? 1 : 0,
        reduced ? REDUCED_FADE : { ...FLIP_TWEEN, delay: order * SHEET_FLIP_STAGGER_S },
      );
    },
    [flips, reduced],
  );

  /** Snap every sheet to the resting state of `target` (used after drags). */
  const settleAll = useCallback(
    (target: number) => {
      flips.forEach((mv, sheet) => {
        const rest = sheet < target ? 1 : 0;
        if (mv.get() !== rest) flipSheet(sheet, rest === 1, 0);
      });
    },
    [flips, flipSheet],
  );

  // Tab taps (and drag releases that changed the index) animate here.
  useEffect(() => {
    const from = logicalIndexRef.current;
    if (from === index) return;
    logicalIndexRef.current = index;
    planSheetFlips(from, index).forEach(({ sheet, flipped, order }) => flipSheet(sheet, flipped, order));
  }, [index, flipSheet]);

  useEffect(
    () => () => {
      controlsRef.current.forEach((c) => c?.stop());
    },
    [],
  );

  const stride = useCallback(() => widthRef.current * strideRatio, [strideRatio]);

  const handlers = useMemo<PagerHandlers>(
    () => ({
      onPointerDown: (e) => {
        if (total <= 1 || !e.isPrimary) return;
        draggedRef.current = false;
        dragRef.current = {
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          base: logicalIndexRef.current,
          lastX: e.clientX,
          lastT: e.timeStamp,
          velocityX: 0,
          dragging: false,
        };
      },
      onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
        const d = dragRef.current;
        if (!d || d.pointerId !== e.pointerId) return;
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        if (!d.dragging) {
          if (Math.abs(dx) < DRAG_START_PX || Math.abs(dx) <= Math.abs(dy)) return;
          d.dragging = true;
          draggedRef.current = true;
          controlsRef.current.forEach((c) => c?.stop());
          e.currentTarget.setPointerCapture(e.pointerId);
        }
        const dt = Math.max(1, e.timeStamp - d.lastT);
        d.velocityX = d.velocityX * 0.6 + (((e.clientX - d.lastX) / dt) * 1000) * 0.4;
        d.lastX = e.clientX;
        d.lastT = e.timeStamp;
        if (reduced) return;
        const s = stride();
        if (s <= 0) return;
        // Dragging left turns the current sheet over; dragging right brings the previous one back.
        if (d.base < total - 1) flips[d.base].set(clamp01(-dx / s));
        if (d.base > 0) flips[d.base - 1].set(1 - clamp01(dx / s));
      },
      onPointerUp: (e) => {
        const d = dragRef.current;
        dragRef.current = null;
        if (!d || d.pointerId !== e.pointerId || !d.dragging) return;
        const target = resolvePagerTarget({
          baseIndex: d.base,
          dx: e.clientX - d.startX,
          velocityX: d.velocityX,
          stridePx: stride(),
          total,
        });
        settleAll(target);
        logicalIndexRef.current = target;
        if (target !== index) onChangeRef.current(target);
      },
      onPointerCancel: (e) => {
        const d = dragRef.current;
        dragRef.current = null;
        if (!d || d.pointerId !== e.pointerId) return;
        settleAll(d.base);
      },
    }),
    [flips, index, reduced, settleAll, stride, total],
  );

  const consumeDragClick = useCallback(() => {
    const wasDrag = draggedRef.current;
    draggedRef.current = false;
    return wasDrag;
  }, []);

  const goTo = useCallback(
    (next: number) => {
      const clamped = clampPageIndex(next, total);
      if (clamped === logicalIndexRef.current) return;
      onChangeRef.current(clamped);
    },
    [total],
  );

  return { flips, goTo, handlers, consumeDragClick, surfaceRef };
}

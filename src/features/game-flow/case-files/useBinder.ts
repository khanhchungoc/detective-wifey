import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { animate, motionValue } from 'motion/react';
import type { AnimationPlaybackControls, MotionValue } from 'motion/react';
import {
  DRAG_START_PX,
  STACK_ACTIVE_Z,
  clampPageIndex,
  resolvePagerTarget,
  resolveSheetRestPose,
} from './pagerLogic';
import type { PagerHandlers } from './usePager';

const SHUFFLE_DURATION_S = 0.31;
const SHUFFLE_EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const INCOMING_LIFT_PX = -34;
const OUTGOING_TUCK_PX = 18;
const SNAP_SPRING = { type: 'spring' as const, stiffness: 360, damping: 32, mass: 0.85 };
const MAX_DRAG_ROTATE_DEG = 3;

export interface SheetMotion {
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  rotate: MotionValue<number>;
  zIndex: MotionValue<number>;
  shade: MotionValue<number>;
}

export interface Binder {
  /** Per-sheet compositor motion values (no React renders during drag or shuffle). */
  sheets: SheetMotion[];
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

const createSheetMotion = (sheetIndex: number, activeIndex: number): SheetMotion => {
  const rest = resolveSheetRestPose(sheetIndex, activeIndex);
  return {
    x: motionValue(0),
    y: motionValue(rest.y),
    scale: motionValue(rest.scale),
    rotate: motionValue(0),
    zIndex: motionValue(rest.zIndex),
    shade: motionValue(rest.shade),
  };
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Physical manila-folder stack: every sheet stays in the stack at all times.
 * Switching pulls the newly selected sheet up and forward onto the top while
 * tucking the outgoing sheet behind the stack. Horizontal drags move the active
 * sheet sideways with subtle tilt and settle cleanly on release.
 */
export function useBinder(params: {
  index: number;
  total: number;
  reduced: boolean;
  /** Distance, as a fraction of the surface width, that counts as a full swipe stride. */
  strideRatio?: number;
  onIndexChange: (index: number) => void;
}): Binder {
  const { index, total, reduced, strideRatio = 0.7, onIndexChange } = params;
  const [sheets] = useState<SheetMotion[]>(() =>
    Array.from({ length: total }, (_, i) => createSheetMotion(i, index)),
  );
  const controlsRef = useRef<AnimationPlaybackControls[]>([]);
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

  const stopAnimations = useCallback(() => {
    controlsRef.current.forEach((c) => c.stop());
    controlsRef.current = [];
  }, []);

  const track = useCallback((ctrl: AnimationPlaybackControls) => {
    controlsRef.current.push(ctrl);
  }, []);

  const applyRestImmediate = useCallback(
    (target: number) => {
      stopAnimations();
      sheets.forEach((mv, sheetIdx) => {
        const rest = resolveSheetRestPose(sheetIdx, target);
        mv.x.set(0);
        mv.y.set(rest.y);
        mv.scale.set(rest.scale);
        mv.rotate.set(0);
        mv.zIndex.set(rest.zIndex);
        mv.shade.set(rest.shade);
      });
    },
    [sheets, stopAnimations],
  );

  const shuffleTo = useCallback(
    (from: number, to: number) => {
      if (reduced) {
        applyRestImmediate(to);
        return;
      }

      stopAnimations();

      sheets.forEach((mv, sheetIdx) => {
        const rest = resolveSheetRestPose(sheetIdx, to);
        const tween = { duration: SHUFFLE_DURATION_S, ease: SHUFFLE_EASE };

        if (sheetIdx === to) {
          // Incoming sheet lifts upward from behind and settles onto the front of the stack.
          mv.zIndex.set(STACK_ACTIVE_Z + 1);
          track(
            animate(mv.y, [mv.y.get(), INCOMING_LIFT_PX, rest.y], {
              duration: SHUFFLE_DURATION_S,
              times: [0, 0.45, 1],
              ease: SHUFFLE_EASE,
              onComplete: () => mv.zIndex.set(rest.zIndex),
            }),
          );
          track(animate(mv.x, 0, tween));
          track(
            animate(mv.scale, [mv.scale.get(), 1.01, rest.scale], {
              duration: SHUFFLE_DURATION_S,
              times: [0, 0.45, 1],
              ease: SHUFFLE_EASE,
            }),
          );
          track(animate(mv.rotate, 0, tween));
          track(animate(mv.shade, rest.shade, tween));
        } else if (sheetIdx === from) {
          // Outgoing sheet tucks smoothly behind the incoming front sheet.
          mv.zIndex.set(rest.zIndex);
          track(
            animate(mv.y, [mv.y.get(), OUTGOING_TUCK_PX, rest.y], {
              duration: SHUFFLE_DURATION_S,
              times: [0, 0.45, 1],
              ease: SHUFFLE_EASE,
            }),
          );
          track(animate(mv.x, 0, tween));
          track(animate(mv.scale, rest.scale, tween));
          track(animate(mv.rotate, 0, tween));
          track(animate(mv.shade, rest.shade, tween));
        } else {
          mv.zIndex.set(rest.zIndex);
          track(animate(mv.x, 0, tween));
          track(animate(mv.y, rest.y, tween));
          track(animate(mv.scale, rest.scale, tween));
          track(animate(mv.rotate, 0, tween));
          track(animate(mv.shade, rest.shade, tween));
        }
      });
    },
    [applyRestImmediate, reduced, sheets, stopAnimations, track],
  );

  // Tab taps and external index changes animate here.
  useEffect(() => {
    const from = logicalIndexRef.current;
    if (from === index) return;
    logicalIndexRef.current = index;
    shuffleTo(from, index);
  }, [index, shuffleTo]);

  useEffect(() => () => stopAnimations(), [stopAnimations]);

  const stride = useCallback(() => widthRef.current * strideRatio, [strideRatio]);

  const snapActiveBack = useCallback(
    (activeIdx: number) => {
      if (reduced) {
        applyRestImmediate(activeIdx);
        return;
      }
      stopAnimations();
      sheets.forEach((mv, sheetIdx) => {
        const rest = resolveSheetRestPose(sheetIdx, activeIdx);
        mv.zIndex.set(rest.zIndex);
        track(animate(mv.x, 0, SNAP_SPRING));
        track(animate(mv.y, rest.y, SNAP_SPRING));
        track(animate(mv.scale, rest.scale, SNAP_SPRING));
        track(animate(mv.rotate, 0, SNAP_SPRING));
        track(animate(mv.shade, rest.shade, SNAP_SPRING));
      });
    },
    [applyRestImmediate, reduced, sheets, stopAnimations, track],
  );

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
          stopAnimations();
          e.currentTarget.setPointerCapture(e.pointerId);
        }
        const dt = Math.max(1, e.timeStamp - d.lastT);
        d.velocityX = d.velocityX * 0.6 + (((e.clientX - d.lastX) / dt) * 1000) * 0.4;
        d.lastX = e.clientX;
        d.lastT = e.timeStamp;
        if (reduced) return;

        const mv = sheets[d.base];
        if (!mv) return;
        const atStartEdge = d.base === 0 && dx > 0;
        const atEndEdge = d.base === total - 1 && dx < 0;
        const visualDx = atStartEdge || atEndEdge ? dx * 0.3 : dx;
        const s = Math.max(1, stride());
        const ratio = clamp(visualDx / s, -1, 1);

        mv.x.set(visualDx);
        mv.rotate.set(ratio * MAX_DRAG_ROTATE_DEG);
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
        if (target === d.base) {
          snapActiveBack(d.base);
          return;
        }
        logicalIndexRef.current = target;
        shuffleTo(d.base, target);
        if (target !== index) onChangeRef.current(target);
      },
      onPointerCancel: (e) => {
        const d = dragRef.current;
        dragRef.current = null;
        if (!d || d.pointerId !== e.pointerId) return;
        if (d.dragging) snapActiveBack(d.base);
      },
    }),
    [index, reduced, sheets, shuffleTo, snapActiveBack, stopAnimations, stride, total],
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

  return { sheets, goTo, handlers, consumeDragClick, surfaceRef };
}

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import {
  DRAG_START_PX,
  STACK_ACTIVE_Z,
  clampPageIndex,
  resolvePagerTarget,
  resolveSheetRestPose,
} from './pagerLogic';
import type { PagerHandlers } from './usePager';

const SHUFFLE_DURATION_MS = 280;
const SNAP_DURATION_MS = 220;
const SHUFFLE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const INCOMING_LIFT_PX = -28;
const OUTGOING_TUCK_PX = 14;
const MAX_DRAG_ROTATE_DEG = 3;

export interface Binder {
  /** Ref callback to attach each sheet DOM node for compositor-thread WAAPI transitions. */
  registerSheet: (index: number) => (el: HTMLDivElement | null) => void;
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
  currentDx: number;
  currentRotate: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const restTransform = (y: number) => `translate3d(0px, ${y}px, 0px)`;
const dragTransform = (x: number, y: number, deg: number) =>
  `translate3d(${x.toFixed(1)}px, ${y}px, 0px) rotate(${deg.toFixed(2)}deg)`;

/**
 * Physical manila-folder stack driven by native compositor-thread WAAPI (`element.animate`).
 * Only the moving sheets animate (`transform: translate3d(...)` only, zero scale or filter
 * re-rasterization), keeping 120Hz smooth frame times on Chrome Android.
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
  const sheetElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const activeAnimsRef = useRef<Animation[]>([]);
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

  const cancelAnimations = useCallback(() => {
    for (const anim of activeAnimsRef.current) {
      anim.cancel();
    }
    activeAnimsRef.current = [];
  }, []);

  const applyRestTransforms = useCallback((target: number) => {
    for (let i = 0; i < sheetElsRef.current.length; i += 1) {
      const el = sheetElsRef.current[i];
      if (!el) continue;
      const rest = resolveSheetRestPose(i, target);
      el.style.transform = restTransform(rest.y);
      el.style.zIndex = String(rest.zIndex);
    }
  }, []);

  const runShuffle = useCallback(
    (from: number, to: number, fromDrag?: { dx: number; rotate: number }) => {
      cancelAnimations();
      applyRestTransforms(to);
      if (reduced) return;

      const toEl = sheetElsRef.current[to];
      const fromEl = sheetElsRef.current[from];
      const toRest = resolveSheetRestPose(to, to);
      const fromRest = resolveSheetRestPose(from, to);
      const toPrev = resolveSheetRestPose(to, from);
      const fromPrev = resolveSheetRestPose(from, from);

      if (toEl && typeof toEl.animate === 'function') {
        toEl.style.zIndex = String(STACK_ACTIVE_Z + 1);
        const anim = toEl.animate(
          [
            { transform: restTransform(toPrev.y), offset: 0 },
            { transform: restTransform(INCOMING_LIFT_PX), offset: 0.45 },
            { transform: restTransform(toRest.y), offset: 1 },
          ],
          { duration: SHUFFLE_DURATION_MS, easing: SHUFFLE_EASE },
        );
        const settleZ = () => {
          if (logicalIndexRef.current === to) {
            toEl.style.zIndex = String(toRest.zIndex);
          }
        };
        anim.onfinish = settleZ;
        anim.oncancel = settleZ;
        activeAnimsRef.current.push(anim);
      }

      if (fromEl && from !== to && typeof fromEl.animate === 'function') {
        const startFrame = fromDrag
          ? dragTransform(fromDrag.dx, fromPrev.y, fromDrag.rotate)
          : restTransform(fromPrev.y);
        const midFrame = fromDrag
          ? dragTransform(fromDrag.dx * 0.35, OUTGOING_TUCK_PX, fromDrag.rotate * 0.35)
          : restTransform(OUTGOING_TUCK_PX);
        const anim = fromEl.animate(
          [
            { transform: startFrame, offset: 0 },
            { transform: midFrame, offset: 0.45 },
            { transform: restTransform(fromRest.y), offset: 1 },
          ],
          { duration: SHUFFLE_DURATION_MS, easing: SHUFFLE_EASE },
        );
        activeAnimsRef.current.push(anim);
      }
    },
    [applyRestTransforms, cancelAnimations, reduced],
  );

  // Tab taps and external index changes animate here.
  useEffect(() => {
    const from = logicalIndexRef.current;
    if (from === index) return;
    logicalIndexRef.current = index;
    runShuffle(from, index);
  }, [index, runShuffle]);

  useEffect(() => () => cancelAnimations(), [cancelAnimations]);

  const stride = useCallback(() => widthRef.current * strideRatio, [strideRatio]);

  const snapActiveBack = useCallback(
    (activeIdx: number, dx: number, rotate: number) => {
      cancelAnimations();
      const el = sheetElsRef.current[activeIdx];
      const rest = resolveSheetRestPose(activeIdx, activeIdx);
      if (!el) return;
      el.style.transform = restTransform(rest.y);
      if (reduced || typeof el.animate !== 'function') return;
      const anim = el.animate(
        [{ transform: dragTransform(dx, rest.y, rotate) }, { transform: restTransform(rest.y) }],
        { duration: SNAP_DURATION_MS, easing: SHUFFLE_EASE },
      );
      activeAnimsRef.current.push(anim);
    },
    [cancelAnimations, reduced],
  );

  const registerSheet = useCallback(
    (sheetIndex: number) => (el: HTMLDivElement | null) => {
      sheetElsRef.current[sheetIndex] = el;
    },
    [],
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
          currentDx: 0,
          currentRotate: 0,
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
          cancelAnimations();
          e.currentTarget.setPointerCapture(e.pointerId);
        }
        const dt = Math.max(1, e.timeStamp - d.lastT);
        d.velocityX = d.velocityX * 0.6 + (((e.clientX - d.lastX) / dt) * 1000) * 0.4;
        d.lastX = e.clientX;
        d.lastT = e.timeStamp;
        if (reduced) return;

        const el = sheetElsRef.current[d.base];
        if (!el) return;
        const atStartEdge = d.base === 0 && dx > 0;
        const atEndEdge = d.base === total - 1 && dx < 0;
        const visualDx = atStartEdge || atEndEdge ? dx * 0.3 : dx;
        const s = Math.max(1, stride());
        const ratio = clamp(visualDx / s, -1, 1);
        const rot = ratio * MAX_DRAG_ROTATE_DEG;
        d.currentDx = visualDx;
        d.currentRotate = rot;

        el.style.transform = dragTransform(visualDx, 0, rot);
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
          snapActiveBack(d.base, d.currentDx, d.currentRotate);
          return;
        }
        logicalIndexRef.current = target;
        runShuffle(d.base, target, { dx: d.currentDx, rotate: d.currentRotate });
        if (target !== index) onChangeRef.current(target);
      },
      onPointerCancel: (e) => {
        const d = dragRef.current;
        dragRef.current = null;
        if (!d || d.pointerId !== e.pointerId) return;
        if (d.dragging) snapActiveBack(d.base, d.currentDx, d.currentRotate);
      },
    }),
    [cancelAnimations, index, reduced, runShuffle, snapActiveBack, stride, total],
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

  return { registerSheet, goTo, handlers, consumeDragClick, surfaceRef };
}

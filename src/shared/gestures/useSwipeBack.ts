import { useEffect, useRef } from 'react';
import { handoffSwipe } from '../motion/transition';

type SwipeSurfaceEvent = { currentTarget?: EventTarget | null; target?: EventTarget | null };

export interface UseSwipeBackOptions {
  /** Callback fired when a right-swipe back gesture is detected */
  onBack: () => void;
  /** Whether the swipe gesture is enabled (default: true) */
  enabled?: boolean;
  /** Minimum horizontal deltaX required to trigger back in px (default: 45) */
  threshold?: number;
  /** Max ratio of |deltaY| to deltaX (default: 0.8) to ensure horizontal swipe */
  maxRatio?: number;
  /** Max duration of gesture in ms (default: 1500) */
  maxDuration?: number;
  /** Max distance in px from the surface's left edge where the swipe can start (e.g. 44 for edge swipe) */
  maxStartDistance?: number;
  /** Optional callback fired per animation frame with swipe progress (0 to 1) and displacement in px */
  onSwipeProgress?: (progress: number, displacement: number) => void;
  /** Optional callback fired when the swipe gesture ends, indicating whether back was committed */
  onSwipeEnd?: (committed: boolean) => void;
}

export interface SwipeCheckParams {
  startX: number;
  startY: number;
  startTime: number;
  endX: number;
  endY: number;
  endTime: number;
  threshold?: number;
  maxRatio?: number;
  maxDuration?: number;
}

/**
 * Pure evaluation function for rightward swipe gestures.
 * Adheres to SRP and pure function testability.
 */
export function isSwipeRightGesture({
  startX,
  startY,
  startTime,
  endX,
  endY,
  endTime,
  threshold = 45,
  maxRatio = 0.8,
  maxDuration = 1500,
}: SwipeCheckParams): boolean {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const elapsed = endTime - startTime;

  return (
    deltaX >= threshold &&
    Math.abs(deltaY) <= deltaX * maxRatio &&
    elapsed <= maxDuration
  );
}

export interface SwipeBackHandlers {
  onTouchStart: (e: SwipeSurfaceEvent & { touches: ArrayLike<{ clientX: number; clientY: number }> }) => void;
  onTouchMove: (e: { touches: ArrayLike<{ clientX: number; clientY: number }> }) => void;
  onTouchCancel: () => void;
  onTouchEnd: (e: { changedTouches: ArrayLike<{ clientX: number; clientY: number }>; stopPropagation?: () => void }) => void;
  onPointerDown: (e: SwipeSurfaceEvent & { pointerType: string; button: number; clientX: number; clientY: number }) => void;
  onPointerMove: (e: { pointerType: string; clientX: number; clientY: number }) => void;
  onPointerCancel: (e?: { pointerType?: string }) => void;
  onPointerLeave: (e?: { pointerType?: string }) => void;
  onPointerUp: (e: { pointerType: string; button: number; clientX: number; clientY: number; stopPropagation?: () => void }) => void;
}
interface SwipeBackEngine extends SwipeBackHandlers { dispose: () => void }

/**
 * Core event binder decoupled from React hook lifecycle.
 * Can be instantiated directly or via the useSwipeBack hook.
 */
export function createSwipeBackEngine(options: UseSwipeBackOptions): SwipeBackEngine {
  let startCoords: { x: number; y: number; time: number } | null = null;
  let lastTriggered = 0;
  let surface: HTMLElement | null = null;
  let displacement = 0;
  let restingTransform = '';
  let settling: { animation: Animation; element: HTMLElement; rest: string } | undefined;
  let frame: number | undefined;
  let width = 0;
  let reducedMotion = false;
  let initialDisplacement = 0;
  const stopFrame = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  };
  const paint = () => {
    frame = undefined;
    if (surface) {
      surface.style.transform = `translate3d(${displacement}px, 0, 0) ${restingTransform}`.trim();
      if (options.onSwipeProgress && width > 0) {
        options.onSwipeProgress(displacement / width, displacement);
      }
    }
  };

  const resetVisual = (animate = true) => {
    if (!surface) return;
    options.onSwipeEnd?.(false);
    stopFrame();
    const element = surface;
    delete element.dataset.swipeSurface;
    const from = `translate3d(${displacement}px, 0, 0) ${restingTransform}`.trim();
    element.style.transform = restingTransform;
    if (animate && displacement && element.animate && !reducedMotion) {
      settling?.animation.cancel();
      const animation = element.animate([{ transform: from }, { transform: restingTransform || 'none' }],
        { duration: 280, easing: 'cubic-bezier(.32,.72,0,1)' });
      settling = { animation, element, rest: restingTransform };
      void animation.finished?.then(() => { if (settling?.animation === animation) settling = undefined; }, () => {});
    }
    surface = null;
    displacement = 0;
  };

  const cancel = () => { startCoords = null; resetVisual(); };
  const begin = (event: SwipeSurfaceEvent, x: number, y: number) => {
    if (options.enabled === false) return;
    const element = event.currentTarget;
    if (typeof HTMLElement !== 'undefined' && element instanceof HTMLElement) {
      if (options.maxStartDistance !== undefined) {
        const rect = element.getBoundingClientRect();
        if (x - rect.left > options.maxStartDistance) return;
      }
      element.dataset.swipeSurface = '';
      if (event.target instanceof Element) {
        // The deepest gesture owner moves; outer shell fallback remains stationary.
        if (event.target.closest('[data-swipe-surface]') !== element
          || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      }
      resetVisual(false);
      initialDisplacement = 0;
      let rest = element.style.transform;
      if (settling?.element === element) {
        // Measure once when re-grabbing, before cancelling the browser animation.
        const visible = getComputedStyle(element).transform;
        rest = settling.rest;
        initialDisplacement = new DOMMatrixReadOnly(visible === 'none' ? undefined : visible).m41
          - new DOMMatrixReadOnly(rest || undefined).m41;
      }
      settling?.animation.cancel();
      settling = undefined;
      surface = element;
      restingTransform = rest;
      width = element.clientWidth;
      reducedMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
      displacement = initialDisplacement;
      if (displacement) paint();
    }
    handleStart(x, y);
  };
  const move = (x: number, y: number) => {
    if (options.enabled === false || !startCoords || !surface) return;
    const maxRatio = options.maxRatio ?? 0.8;
    const dx = x - startCoords.x;
    const dy = Math.abs(y - startCoords.y);

    // Cancel gesture only when movement is clearly an intentional vertical scroll
    // (substantial vertical travel that dominates horizontal movement) or significant leftward swipe.
    // Preserves fluid thumb swipes with initial contact jitter (< 30px vertical).
    if (dy > 30 && dy > Math.abs(dx) * 1.2) { cancel(); return; }
    if (dx < -30) { cancel(); return; }

    if ((!initialDisplacement && dx < 10) || dy > Math.abs(dx) * maxRatio || reducedMotion) return;
    displacement = Math.max(0, Math.min(initialDisplacement + dx, width));
    if (frame === undefined) frame = requestAnimationFrame(paint);
  };

  const handleStart = (clientX: number, clientY: number) => {
    if (options.enabled === false) return;
    startCoords = { x: clientX, y: clientY, time: Date.now() };
  };

  const handleEnd = (clientX: number, clientY: number, stopProp?: () => void) => {
    if (options.enabled === false || !startCoords) { cancel(); return; }
    const { x: startX, y: startY, time: startTime } = startCoords;
    startCoords = null;
    const now = Date.now();

    if (
      isSwipeRightGesture({
        startX,
        startY,
        startTime,
        endX: clientX,
        endY: clientY,
        endTime: now,
        threshold: options.threshold,
        maxRatio: options.maxRatio,
        maxDuration: options.maxDuration,
      }) &&
      now - lastTriggered > 350
    ) {
      lastTriggered = now;
      if (stopProp) {
        stopProp();
      }
      stopFrame();
      paint();
      options.onSwipeEnd?.(true);
      const element = surface;
      if (element) delete element.dataset.swipeSurface;
      const rest = restingTransform;
      const distance = displacement;
      surface = null;
      displacement = 0;
      handoffSwipe(distance, () => { if (element) element.style.transform = rest; }, options.onBack);
    } else {
      resetVisual();
    }
  };

  return {
    dispose: () => {
      startCoords = null;
      if (surface) delete surface.dataset.swipeSurface;
      resetVisual(false);
      stopFrame();
      settling?.animation.cancel();
      settling = undefined;
    },
    onTouchStart: (e) => {
      if (e.touches && e.touches.length === 1) {
        begin(e, e.touches[0].clientX, e.touches[0].clientY);
      } else cancel();
    },
    onTouchMove: e => { if (e.touches.length === 1) move(e.touches[0].clientX, e.touches[0].clientY); else cancel(); },
    onTouchCancel: cancel,
    onTouchEnd: (e: { changedTouches: ArrayLike<{ clientX: number; clientY: number }>; stopPropagation?: () => void }) => {
      if (e.changedTouches && e.changedTouches.length >= 1) {
        handleEnd(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY,
          () => e.stopPropagation?.()
        );
      }
    },
    onPointerDown: (e) => {
      if (e.pointerType === 'mouse' && e.button === 0) {
        begin(e, e.clientX, e.clientY);
      }
    },
    onPointerMove: e => { if (e.pointerType === 'mouse') move(e.clientX, e.clientY); },
    onPointerCancel: (e?: { pointerType?: string }) => {
      if (!e || !e.pointerType || e.pointerType === 'mouse') cancel();
    },
    onPointerLeave: (e?: { pointerType?: string }) => {
      if (!e || !e.pointerType || e.pointerType === 'mouse') cancel();
    },
    onPointerUp: (e: { pointerType: string; button: number; clientX: number; clientY: number; stopPropagation?: () => void }) => {
      if (e.pointerType === 'mouse' && e.button === 0) {
        handleEnd(e.clientX, e.clientY, () => e.stopPropagation?.());
      }
    },
  };
}

/**
 * Universal gesture hook: Swipe Right to Go Back.
 * Detects touch or mouse drag gestures from left-to-right.
 * Stops propagation on trigger so nested views only pop one level at a time.
 */
export function useSwipeBack(options: UseSwipeBackOptions): SwipeBackHandlers {
  const engineRef = useRef<{ handlers: SwipeBackHandlers; dispose: () => void } | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  useEffect(() => () => engineRef.current?.dispose(), []);

  if (!engineRef.current) {
    const { dispose, ...handlers } = createSwipeBackEngine({
      onBack: () => optionsRef.current.onBack(),
      get enabled() {
        return optionsRef.current.enabled ?? true;
      },
      get threshold() {
        return optionsRef.current.threshold ?? 45;
      },
      get maxRatio() {
        return optionsRef.current.maxRatio ?? 0.8;
      },
      get maxDuration() {
        return optionsRef.current.maxDuration ?? 1500;
      },
    });
    engineRef.current = { handlers, dispose };
  }

  return engineRef.current.handlers;
}


import { useEffect, useRef } from 'react';
import { handoffLift } from '../motion/transition';

/** Lifted card corner radius in px; motion.css `--app-card-radius` owns the value. */
function liftRadius(): number {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return 44;
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--app-card-radius')) || 44;
}

type GestureSurfaceEvent = {
  currentTarget?: EventTarget | null;
  target?: EventTarget | null;
};

export interface UseSwipeHomeOptions {
  /** Callback fired when an upward swipe home gesture is detected from the bottom of the UI */
  onHome: () => void;
  /** Whether the gesture is enabled (default: true) */
  enabled?: boolean;
  /** Minimum upward deltaY required to trigger home in px (default: 40) */
  threshold?: number;
  /** Max ratio of |deltaX| to upward deltaY (default: 0.8) to ensure vertical dominance */
  maxRatio?: number;
  /** Max duration of gesture in ms (default: 1500) */
  maxDuration?: number;
  /** Height of the generous bottom trigger area in px from the container bottom (default: 72) */
  triggerAreaHeight?: number;
  /** Optional getter for the container element to measure distance from bottom */
  getContainer?: () => HTMLElement | null;
}

export interface SwipeHomeCheckParams {
  startX: number;
  startY: number;
  startTime: number;
  endX: number;
  endY: number;
  endTime: number;
  containerBottom?: number;
  triggerAreaHeight?: number;
  threshold?: number;
  maxRatio?: number;
  maxDuration?: number;
}

/**
 * Pure evaluation function for upward swipe home gestures from the bottom of the UI.
 * Adheres to SRP and pure function testability.
 */
export function isSwipeHomeGesture({
  startX,
  startY,
  startTime,
  endX,
  endY,
  endTime,
  containerBottom,
  triggerAreaHeight = 72,
  threshold = 40,
  maxRatio = 0.8,
  maxDuration = 1500,
}: SwipeHomeCheckParams): boolean {
  // If containerBottom is specified, check that the gesture started within the generous trigger zone
  if (containerBottom !== undefined && containerBottom > 0) {
    const distanceFromBottom = containerBottom - startY;
    // Allow slight overflow (-25px) for touches at the absolute screen edge
    if (distanceFromBottom < -25 || distanceFromBottom > triggerAreaHeight) {
      return false;
    }
  }

  const deltaX = endX - startX;
  const upwardDistance = startY - endY; // deltaY is negative when swiping up
  const elapsed = endTime - startTime;

  return (
    upwardDistance >= threshold &&
    Math.abs(deltaX) <= upwardDistance * maxRatio &&
    elapsed <= maxDuration
  );
}

export interface SwipeHomeHandlers {
  onTouchStart: (e: GestureSurfaceEvent & { touches: ArrayLike<{ clientX: number; clientY: number }> }) => void;
  onTouchMove: (e: { touches: ArrayLike<{ clientX: number; clientY: number }> }) => void;
  onTouchCancel: () => void;
  onTouchEnd: (e: { changedTouches: ArrayLike<{ clientX: number; clientY: number }>; stopPropagation?: () => void }) => void;
  onPointerDown: (e: GestureSurfaceEvent & { pointerType: string; button: number; clientX: number; clientY: number }) => void;
  onPointerMove: (e: { pointerType: string; clientX: number; clientY: number }) => void;
  onPointerCancel: (e?: { pointerType?: string }) => void;
  onPointerLeave: (e?: { pointerType?: string }) => void;
  onPointerUp: (e: { pointerType: string; button: number; clientX: number; clientY: number; stopPropagation?: () => void }) => void;
}

export interface SwipeHomeEngine extends SwipeHomeHandlers {
  dispose: () => void;
}

/**
 * Core event binder decoupled from React hook lifecycle.
 * Can be instantiated directly or via the useSwipeHome hook.
 */
export function createSwipeHomeEngine(options: UseSwipeHomeOptions): SwipeHomeEngine {
  let startCoords: { x: number; y: number; time: number; containerBottom?: number } | null = null;
  let lastCoords: { x: number; y: number; time: number } | null = null;
  let lastTriggered = 0;
  let surface: HTMLElement | null = null;
  let settling: Animation | undefined;
  let frame: number | undefined;
  let tx = 0;
  let ty = 0;
  let scale = 1;
  let radius = 0;
  let maxRadius = 44;
  let lifted = false;
  let reducedMotion = false;

  const stopFrame = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  };

  const paint = () => {
    frame = undefined;
    if (surface && lifted) {
      surface.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
      surface.style.borderRadius = `${radius}px`;
    }
  };

  const resetVisual = (animate = true) => {
    stopFrame();
    if (!surface) {
      tx = 0;
      ty = 0;
      scale = 1;
      lifted = false;
      return;
    }
    const element = surface;
    const wasLifted = lifted;
    const from = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
    const fromRadius = `${radius}px`;
    surface = null;
    tx = 0;
    ty = 0;
    scale = 1;
    lifted = false;
    element.style.transform = '';
    element.style.willChange = '';
    element.style.borderRadius = '';
    if (animate && wasLifted && element.animate && !reducedMotion) {
      settling?.cancel();
      const anim = element.animate(
        [{ transform: from, borderRadius: fromRadius }, { transform: 'translate3d(0, 0, 0) scale(1)', borderRadius: '0px' }],
        { duration: 280, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' },
      );
      settling = anim;
      void anim.finished?.then(() => { if (settling === anim) settling = undefined; }, () => {});
    }
  };

  const cancel = (animate = true) => {
    startCoords = null;
    lastCoords = null;
    resetVisual(animate);
  };

  const resolveContainer = (element?: EventTarget | null): HTMLElement | null => {
    if (options.getContainer) {
      const container = options.getContainer();
      if (container) return container;
    }
    if (typeof HTMLElement !== 'undefined' && element instanceof HTMLElement) {
      return element;
    }
    return null;
  };

  const resolveBottom = (element?: EventTarget | null): number | undefined => {
    const container = resolveContainer(element);
    if (container && typeof container.getBoundingClientRect === 'function') {
      const rect = container.getBoundingClientRect();
      if (rect.bottom > 0) return rect.bottom;
      if (container.clientHeight > 0) return container.clientHeight;
    }
    if (typeof window !== 'undefined' && window.innerHeight > 0) {
      return window.innerHeight;
    }
    return undefined;
  };

  const handleStart = (event: GestureSurfaceEvent, clientX: number, clientY: number) => {
    if (options.enabled === false) return;

    if (typeof Element !== 'undefined' && event.target instanceof Element) {
      if (event.target.closest('input, textarea, select, [contenteditable="true"]')) {
        return;
      }
    }

    const container = resolveContainer(event.currentTarget);
    const containerBottom = resolveBottom(event.currentTarget);
    const triggerAreaHeight = options.triggerAreaHeight ?? 72;

    if (containerBottom !== undefined && containerBottom > 0) {
      const distanceFromBottom = containerBottom - clientY;
      if (distanceFromBottom < -25 || distanceFromBottom > triggerAreaHeight) {
        return; // Outside generous bottom trigger area
      }
    }

    settling?.cancel();
    settling = undefined;
    reducedMotion = typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    surface = container?.querySelector?.<HTMLElement>('[data-app-surface]') ?? null;
    tx = 0;
    ty = 0;
    scale = 1;
    radius = 0;
    maxRadius = liftRadius();
    lifted = false;
    startCoords = { x: clientX, y: clientY, time: Date.now(), containerBottom };
    lastCoords = null;
  };

  const trackMove = (clientX: number, clientY: number) => {
    if (!startCoords) return;
    lastCoords = { x: clientX, y: clientY, time: Date.now() };
    if (!surface || reducedMotion) return;
    const upward = Math.max(0, startCoords.y - clientY);
    if (!lifted && upward <= 4) return;
    if (!lifted) {
      lifted = true;
      surface.style.willChange = 'transform';
    }
    const progress = Math.min(1, upward / 260);
    // Corners go from the screen's sharp edge to a rounded card early in the lift.
    radius = Number((Math.min(1, progress * 3) * maxRadius).toFixed(1));
    scale = Number((1 - progress * 0.28).toFixed(4));
    tx = Number(((clientX - startCoords.x) * 0.45).toFixed(1));
    ty = Number((-upward * 0.55).toFixed(1));
    if (frame === undefined && typeof requestAnimationFrame === 'function') {
      frame = requestAnimationFrame(paint);
    } else if (typeof requestAnimationFrame !== 'function') {
      paint();
    }
  };

  const triggerHome = (endX: number, endY: number, endTime: number, stopProp?: () => void): boolean => {
    if (options.enabled === false || !startCoords) {
      cancel();
      return false;
    }

    const { x: startX, y: startY, time: startTime, containerBottom } = startCoords;
    const isGesture = isSwipeHomeGesture({
      startX,
      startY,
      startTime,
      endX,
      endY,
      endTime,
      containerBottom,
      triggerAreaHeight: options.triggerAreaHeight ?? 72,
      threshold: options.threshold ?? 40,
      maxRatio: options.maxRatio ?? 0.8,
      maxDuration: options.maxDuration ?? 1500,
    });

    if (isGesture && endTime - lastTriggered > 350) {
      lastTriggered = endTime;
      const draggedSurface = surface;
      const wasLifted = lifted;
      const pose = { x: tx, y: ty, scale };
      stopFrame();
      // The outgoing snapshot must hold the last finger pose.
      if (draggedSurface && wasLifted) paint();
      startCoords = null;
      lastCoords = null;
      surface = null;
      tx = 0;
      ty = 0;
      scale = 1;
      lifted = false;
      if (stopProp) {
        stopProp();
      }
      const release = () => {
        if (!draggedSurface) return;
        draggedSurface.style.transform = '';
        draggedSurface.style.willChange = '';
        draggedSurface.style.borderRadius = '';
      };
      if (draggedSurface && wasLifted) {
        // Close keyframe replays the finger pose, then flies the card into its icon.
        handoffLift(pose, release, () => options.onHome());
      } else {
        release();
        options.onHome();
      }
      return true;
    }

    return false;
  };

  const handleEnd = (clientX: number, clientY: number, stopProp?: () => void) => {
    const success = triggerHome(clientX, clientY, Date.now(), stopProp);
    if (!success) {
      cancel(true);
    }
  };

  return {
    dispose: () => {
      settling?.cancel();
      settling = undefined;
      cancel(false);
    },
    onTouchStart: (e) => {
      if (e.touches && e.touches.length === 1) {
        handleStart(e, e.touches[0].clientX, e.touches[0].clientY);
      } else {
        cancel();
      }
    },
    onTouchMove: (e) => {
      if (!startCoords || !e.touches || e.touches.length !== 1) return;
      trackMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    onTouchCancel: () => {
      if (startCoords && lastCoords) {
        const success = triggerHome(lastCoords.x, lastCoords.y, lastCoords.time);
        if (success) return;
      }
      cancel();
    },
    onTouchEnd: (e) => {
      if (e.changedTouches && e.changedTouches.length >= 1) {
        handleEnd(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY,
          () => e.stopPropagation?.()
        );
      } else if (lastCoords) {
        handleEnd(lastCoords.x, lastCoords.y);
      } else {
        cancel();
      }
    },
    onPointerDown: (e) => {
      if (e.pointerType === 'mouse' && e.button === 0) {
        handleStart(e, e.clientX, e.clientY);
      }
    },
    onPointerMove: (e) => {
      if (e.pointerType === 'mouse' && startCoords) {
        trackMove(e.clientX, e.clientY);
      }
    },
    onPointerCancel: (e?: { pointerType?: string }) => {
      if (!e || !e.pointerType || e.pointerType === 'mouse') cancel();
    },
    onPointerLeave: (e?: { pointerType?: string }) => {
      if (!e || !e.pointerType || e.pointerType === 'mouse') cancel();
    },
    onPointerUp: (e) => {
      if (e.pointerType === 'mouse' && e.button === 0) {
        handleEnd(e.clientX, e.clientY, () => e.stopPropagation?.());
      }
    },
  };
}

/**
 * Universal gesture hook: Swipe Up from Bottom to Go Home.
 * Detects touch or mouse drag gestures from the generous bottom area upwards.
 * Stops propagation on trigger so child gestures don't conflict.
 */
export function useSwipeHome(options: UseSwipeHomeOptions): SwipeHomeHandlers {
  const engineRef = useRef<{ handlers: SwipeHomeHandlers; dispose: () => void } | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  useEffect(() => () => engineRef.current?.dispose(), []);

  if (!engineRef.current) {
    const { dispose, ...handlers } = createSwipeHomeEngine({
      onHome: () => optionsRef.current.onHome(),
      get enabled() {
        return optionsRef.current.enabled ?? true;
      },
      get threshold() {
        return optionsRef.current.threshold ?? 40;
      },
      get maxRatio() {
        return optionsRef.current.maxRatio ?? 0.8;
      },
      get maxDuration() {
        return optionsRef.current.maxDuration ?? 1500;
      },
      get triggerAreaHeight() {
        return optionsRef.current.triggerAreaHeight ?? 72;
      },
      getContainer: () => optionsRef.current.getContainer?.() ?? null,
    });
    engineRef.current = { handlers, dispose };
  }

  return engineRef.current.handlers;
}

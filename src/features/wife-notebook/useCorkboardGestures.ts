import { useCallback, useEffect, useRef, useState } from 'react';
import { clampZoom, CANVAS_HEIGHT, CANVAS_WIDTH, MAX_ZOOM } from './graphEngine';
import type { CorkboardViewport } from './types';

export function formatCorkboardTransform(viewport: CorkboardViewport, settledZoom = viewport.zoom): string {
  const tx = Math.round(-viewport.x * viewport.zoom * 100) / 100;
  const ty = Math.round(-viewport.y * viewport.zoom * 100) / 100;
  const relScale = settledZoom > 0 ? viewport.zoom / settledZoom : 1;
  // Always 3D so the plane stays on its own GPU layer between gestures (2D <-> 3D swaps re-create the layer and flash).
  if (Math.abs(relScale - 1) < 0.0005) {
    return `translate3d(${tx}px, ${ty}px, 0)`;
  }
  const scale = Math.round(relScale * 10000) / 10000;
  return `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
}

/** Absolute GPU transform for the fixed-size chalkboard surface (never uses CSS zoom, so zooming never invalidates GPU tiles). */
export function formatSurfaceTransform(viewport: CorkboardViewport): string {
  const tx = Math.round(-viewport.x * viewport.zoom * 100) / 100;
  const ty = Math.round(-viewport.y * viewport.zoom * 100) / 100;
  const scale = Math.round(viewport.zoom * 10000) / 10000;
  return `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;
}

const DOUBLE_TAP_ZOOM = MAX_ZOOM;

export interface UseCorkboardGesturesOptions {
  initialViewport?: CorkboardViewport;
  /** Single tap on empty board space; receives the tapped point in board coordinates. */
  onTapBackground?: (worldPoint: { x: number; y: number }) => void;
  /** Double tap on empty board space; overrides the default 1x/2x zoom toggle when provided. */
  onDoubleTapBackground?: (worldPoint: { x: number; y: number }) => void;
  /** Ignore pan, pinch and wheel input (e.g. wall overview mode). */
  locked?: boolean;
  /** Skip animated camera moves (prefers-reduced-motion). */
  reducedMotion?: boolean;
  planeRef?: React.RefObject<HTMLDivElement | null>;
  /** Board surface plane rendered under the fixed lamp; scales purely on GPU without CSS zoom. */
  surfaceRef?: React.RefObject<HTMLDivElement | null>;
  boardRef?: React.RefObject<HTMLDivElement | null>;
}

export function useCorkboardGestures(options?: UseCorkboardGesturesOptions) {
  const onTapBackground = options?.onTapBackground;
  const onDoubleTapBackground = options?.onDoubleTapBackground;
  const planeRef = options?.planeRef;
  const surfaceRef = options?.surfaceRef;
  const boardRef = options?.boardRef;
  const lockedRef = useRef(Boolean(options?.locked));
  lockedRef.current = Boolean(options?.locked);
  const reducedMotionRef = useRef(Boolean(options?.reducedMotion));
  reducedMotionRef.current = Boolean(options?.reducedMotion);
  const animationFrameRef = useRef<number | null>(null);
  const [viewport, commitViewport] = useState<CorkboardViewport>(() => options?.initialViewport ?? {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    zoom: 1.0,
  });

  // Keep input calculations current while committing at most once per display frame.
  // When planeRef is attached, active pan/pinch/wheel updates a relative GPU transform
  // (zero layout/React cost) and commits crisp CSS zoom once the gesture settles.
  const viewportRef = useRef(viewport);
  const settledZoomRef = useRef(viewport.zoom);
  settledZoomRef.current = viewport.zoom;
  const frameRef = useRef<number | null>(null);
  const wheelSettleTimerRef = useRef<number | null>(null);
  const pendingCommitRef = useRef(false);

  const applyPlaneTransform = useCallback((next: CorkboardViewport, activeGesture = false) => {
    const plane = planeRef?.current;
    if (plane) {
      let transform: string;
      if (activeGesture) {
        const tx = Math.round(-next.x * next.zoom * 100) / 100;
        const ty = Math.round(-next.y * next.zoom * 100) / 100;
        const relScale = settledZoomRef.current > 0
          ? Math.round((next.zoom / settledZoomRef.current) * 10000) / 10000
          : 1;
        transform = `translate3d(${tx}px, ${ty}px, 0) scale(${relScale})`;
      } else {
        transform = formatCorkboardTransform(next, settledZoomRef.current);
      }
      plane.style.transform = transform;
    }
    if (surfaceRef?.current) {
      surfaceRef.current.style.transform = formatSurfaceTransform(next);
    }
  }, [planeRef, surfaceRef]);

  const flushViewportCommit = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    if (wheelSettleTimerRef.current !== null) {
      window.clearTimeout(wheelSettleTimerRef.current);
      wheelSettleTimerRef.current = null;
    }
    pendingCommitRef.current = false;
    const next = viewportRef.current;
    // Keep planeRef scaled against the still-committed DOM zoom until React commits both
    // the new CSS zoom and the settled transform together (prevents a 1-frame scale flash).
    const zoomChanged = Math.abs(next.zoom - settledZoomRef.current) >= 0.0005;
    applyPlaneTransform(next, zoomChanged);
    commitViewport(next);
  }, [applyPlaneTransform]);

  const scheduleViewportUpdate = useCallback((update: React.SetStateAction<CorkboardViewport>, commitToReact: boolean) => {
    viewportRef.current = typeof update === 'function' ? update(viewportRef.current) : update;
    if (commitToReact || !planeRef?.current) {
      pendingCommitRef.current = true;
    }
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const shouldCommit = pendingCommitRef.current || !planeRef?.current;
      pendingCommitRef.current = false;
      if (shouldCommit) {
        const next = viewportRef.current;
        const zoomChanged = Math.abs(next.zoom - settledZoomRef.current) >= 0.0005;
        applyPlaneTransform(next, zoomChanged);
        commitViewport(next);
      } else {
        applyPlaneTransform(viewportRef.current, true);
      }
    });
  }, [applyPlaneTransform, planeRef]);

  const setViewport = useCallback((update: React.SetStateAction<CorkboardViewport>) => {
    scheduleViewportUpdate(update, true);
  }, [scheduleViewportUpdate]);

  const cancelAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }, []);

  // Eased camera flight on the GPU plane (no React renders); commits crisp zoom on arrival.
  const animateTo = useCallback((target: CorkboardViewport, durationMs = 420) => {
    cancelAnimation();
    if (durationMs <= 0 || !planeRef?.current) {
      scheduleViewportUpdate(target, true);
      return;
    }
    const from = viewportRef.current;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      // Interpolate zoom in log space so zoom-in and zoom-out feel equally paced.
      const zoom = Math.exp(Math.log(from.zoom) + (Math.log(target.zoom) - Math.log(from.zoom)) * eased);
      viewportRef.current = {
        x: from.x + (target.x - from.x) * eased,
        y: from.y + (target.y - from.y) * eased,
        zoom,
      };
      if (t < 1) {
        applyPlaneTransform(viewportRef.current, true);
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        animationFrameRef.current = null;
        viewportRef.current = target;
        flushViewportCommit();
      }
    };
    animationFrameRef.current = requestAnimationFrame(step);
  }, [applyPlaneTransform, cancelAnimation, flushViewportCommit, planeRef, scheduleViewportUpdate]);

  useEffect(() => () => {
    if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    if (wheelSettleTimerRef.current !== null) window.clearTimeout(wheelSettleTimerRef.current);
    wheelSettleTimerRef.current = null;
  }, []);

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, startCamX: 0, startCamY: 0, moved: false });
  const pinchStart = useRef<{
    initialDist: number;
    initialZoom: number;
    initialCamX: number;
    initialCamY: number;
    centroidX: number;
    centroidY: number;
    screenCenterX: number;
    screenCenterY: number;
  } | null>(null);
  const lastTapTime = useRef(0);
  const touchPointers = useRef(new Map<number, { clientX: number; clientY: number }>());
  const multiTouch = useRef(false);
  const [isPinching, setIsPinching] = useState(false);

  // Discrete Step Zoom Handlers
  const zoomIn = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      zoom: clampZoom(Math.round((prev.zoom + 0.25) * 100) / 100),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      zoom: clampZoom(Math.round((prev.zoom - 0.25) * 100) / 100),
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setViewport({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      zoom: 1.0,
    });
  }, []);

  const setCenter = useCallback((x: number, y: number) => {
    setViewport(prev => ({ ...prev, x, y }));
  }, []);

  // Desktop Trackpad Pinch-Zoom (ctrlKey/metaKey) & Two-Finger Pan Handler
  const applyWheelGesture = useCallback((
    e: Pick<WheelEvent, 'preventDefault' | 'clientX' | 'clientY' | 'deltaX' | 'deltaY' | 'deltaMode' | 'ctrlKey' | 'metaKey'>,
    target: HTMLElement,
  ) => {
    e.preventDefault();
    if (lockedRef.current || animationFrameRef.current !== null) return;
    const rect = target.getBoundingClientRect();
    const unitScale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rect.height : 1;
    const dxPixels = e.deltaX * unitScale;
    const dyPixels = e.deltaY * unitScale;
    const useDirectPlane = Boolean(planeRef?.current);

    if (useDirectPlane) {
      if (wheelSettleTimerRef.current !== null) {
        window.clearTimeout(wheelSettleTimerRef.current);
      }
      wheelSettleTimerRef.current = window.setTimeout(() => {
        wheelSettleTimerRef.current = null;
        flushViewportCommit();
      }, 120);
    }

    if (e.ctrlKey || e.metaKey) {
      const offsetX = e.clientX - rect.left - rect.width / 2;
      const offsetY = e.clientY - rect.top - rect.height / 2;
      scheduleViewportUpdate(prev => {
        const zoom = clampZoom(prev.zoom * Math.exp(-dyPixels * 0.008));
        if (zoom === prev.zoom) return prev;
        return {
          zoom,
          x: prev.x + offsetX / prev.zoom - offsetX / zoom,
          y: prev.y + offsetY / prev.zoom - offsetY / zoom,
        };
      }, !useDirectPlane);
      return;
    }

    scheduleViewportUpdate(prev => ({
      ...prev,
      x: Math.max(-100, Math.min(CANVAS_WIDTH + 100, prev.x + dxPixels / prev.zoom)),
      y: Math.max(-100, Math.min(CANVAS_HEIGHT + 100, prev.y + dyPixels / prev.zoom)),
    }), !useDirectPlane);
  }, [flushViewportCommit, planeRef, scheduleViewportUpdate]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (boardRef?.current) return;
    applyWheelGesture(e, e.currentTarget);
  }, [applyWheelGesture, boardRef]);

  // Attach a native non-passive wheel listener so trackpad pinch (ctrlKey + wheel)
  // and two-finger panning call preventDefault() cleanly without zooming/scrolling the page.
  useEffect(() => {
    const board = boardRef?.current;
    if (!board || typeof board.addEventListener !== 'function') return;
    const onNativeWheel = (e: WheelEvent) => {
      applyWheelGesture(e, board);
    };
    board.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => board.removeEventListener('wheel', onNativeWheel);
  }, [applyWheelGesture, boardRef]);

  // Pointer / Mouse Drag Panning Handlers
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Pan from background or strings; cards and controls keep their own gestures.
    if (e.button !== 0 || multiTouch.current || lockedRef.current || animationFrameRef.current !== null) return;
    if ((e.target as HTMLElement).closest('button, .corkboard-node-card, .corkboard-control-dock, .corkboard-drawer')) {
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left <= 44) {
      return;
    }

    e.stopPropagation();
    isDragging.current = true;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      startCamX: viewportRef.current.x,
      startCamY: viewportRef.current.y,
      moved: false,
    };
    // Leave string taps targeted at the string until a drag is confirmed.
    if (!(e.target as Element).closest('.corkboard-string')) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || multiTouch.current) return;
    e.stopPropagation();
    const rawDx = e.clientX - dragStart.current.x;
    const rawDy = e.clientY - dragStart.current.y;
    if (!dragStart.current.moved && Math.hypot(rawDx, rawDy) > 6) {
      dragStart.current.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    const dx = rawDx / viewportRef.current.zoom;
    const dy = rawDy / viewportRef.current.zoom;

    // Generous boundary padding (100 past each board edge) so edge cards are never clipped
    scheduleViewportUpdate(prev => ({
      ...prev,
      x: Math.max(-100, Math.min(CANVAS_WIDTH + 100, dragStart.current.startCamX - dx)),
      y: Math.max(-100, Math.min(CANVAS_HEIGHT + 100, dragStart.current.startCamY - dy)),
    }), false);
  }, [scheduleViewportUpdate]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || multiTouch.current) return;
    isDragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already lost
    }

    if (dragStart.current.moved) {
      flushViewportCommit();
      return;
    }

    // Double-tap zoom toggle or single-tap background selection dismissal
    if (!(e.target as Element).closest('.corkboard-string, .corkboard-node-card, button')) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const cam = viewportRef.current;
      const point = {
        x: cam.x + (e.clientX - rect.left - rect.width / 2) / cam.zoom,
        y: cam.y + (e.clientY - rect.top - rect.height / 2) / cam.zoom,
      };
      const now = Date.now();
      if (now - lastTapTime.current < 320 && !lockedRef.current) {
        lastTapTime.current = 0;
        if (onDoubleTapBackground) {
          onDoubleTapBackground(point);
        } else {
          // Default double tap: zoom in to 2x (or back out to 1x), keeping the tapped spot under the finger.
          const zoom = cam.zoom >= DOUBLE_TAP_ZOOM - 0.1 ? 1.0 : DOUBLE_TAP_ZOOM;
          const keep = cam.zoom / zoom;
          animateTo({
            x: point.x - (point.x - cam.x) * keep,
            y: point.y - (point.y - cam.y) * keep,
            zoom,
          }, reducedMotionRef.current ? 0 : 280);
        }
      } else {
        onTapBackground?.(point);
        lastTapTime.current = now;
      }
    }
  }, [animateTo, flushViewportCommit, onDoubleTapBackground, onTapBackground]);

  // Capture touch pointers before card drag handlers. One owner for the entire pinch,
  // including the remaining finger after the first finger lifts.
  const handleTouchPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch' || lockedRef.current || animationFrameRef.current !== null) return;
    if ((e.target as HTMLElement).closest('button, .corkboard-control-dock, .corkboard-drawer')) return;
    touchPointers.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
    if (touchPointers.current.size < 2) return;
    e.stopPropagation();
    isDragging.current = false;
    lastTapTime.current = 0;
    multiTouch.current = true;
    setIsPinching(true);
    const [t1, t2] = [...touchPointers.current.values()];
    const rect = e.currentTarget.getBoundingClientRect();
    pinchStart.current = {
      initialDist: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY),
      initialZoom: viewportRef.current.zoom,
      initialCamX: viewportRef.current.x,
      initialCamY: viewportRef.current.y,
      centroidX: (t1.clientX + t2.clientX) / 2 - rect.left - rect.width / 2,
      centroidY: (t1.clientY + t2.clientY) / 2 - rect.top - rect.height / 2,
      screenCenterX: rect.left + rect.width / 2,
      screenCenterY: rect.top + rect.height / 2,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleTouchPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!touchPointers.current.has(e.pointerId)) return;
    touchPointers.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
    if (!multiTouch.current) return;
    e.stopPropagation();
    const start = pinchStart.current;
    if (touchPointers.current.size !== 2 || !start) return;
    const [t1, t2] = [...touchPointers.current.values()];
    const zoom = clampZoom(start.initialZoom *
      Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY) / Math.max(1, start.initialDist));
    scheduleViewportUpdate({
      zoom,
      x: start.initialCamX + start.centroidX / start.initialZoom -
        ((t1.clientX + t2.clientX) / 2 - start.screenCenterX) / zoom,
      y: start.initialCamY + start.centroidY / start.initialZoom -
        ((t1.clientY + t2.clientY) / 2 - start.screenCenterY) / zoom,
    }, false);
  };

  const handleTouchPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    touchPointers.current.delete(e.pointerId);
    if (!multiTouch.current) return;
    e.stopPropagation();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (touchPointers.current.size < 2) pinchStart.current = null;
    if (touchPointers.current.size === 0) {
      multiTouch.current = false;
      if (planeRef?.current) {
        flushViewportCommit();
      }
      setIsPinching(false);
    }
  };

  return {
    viewport,
    viewportRef,
    isPinching,
    setViewport,
    zoomIn,
    zoomOut,
    resetZoom,
    setCenter,
    animateTo,
    containerProps: {
      onClickCapture: (e: React.MouseEvent<HTMLDivElement>) => {
        if (dragStart.current.moved) {
          e.stopPropagation();
          e.preventDefault();
          dragStart.current.moved = false;
        }
      },
      onPointerDownCapture: handleTouchPointerDown,
      onPointerMoveCapture: handleTouchPointerMove,
      onPointerUpCapture: handleTouchPointerEnd,
      onPointerCancelCapture: handleTouchPointerEnd,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: () => {
        const wasMoved = isDragging.current && dragStart.current.moved;
        isDragging.current = false;
        lastTapTime.current = 0;
        if (wasMoved && planeRef?.current) {
          flushViewportCommit();
        }
      },
      onWheel: handleWheel,
      style: { touchAction: 'none' as const },
    },
  };
}

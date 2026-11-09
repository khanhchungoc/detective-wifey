import { useCallback, useEffect, useRef, useState } from 'react';
import { clampZoom, CANVAS_SIZE } from './graphEngine';
import type { CorkboardViewport } from './types';

export interface UseCorkboardGesturesOptions {
  initialViewport?: CorkboardViewport;
  onTapBackground?: () => void;
}

export function useCorkboardGestures(options?: UseCorkboardGesturesOptions) {
  const onTapBackground = options?.onTapBackground;
  const [viewport, commitViewport] = useState<CorkboardViewport>(() => options?.initialViewport ?? {
    x: CANVAS_SIZE / 2,
    y: CANVAS_SIZE / 2,
    zoom: 1.0,
  });

  // Keep input calculations current while committing at most once per display frame.
  const viewportRef = useRef(viewport);
  const frameRef = useRef<number | null>(null);
  const setViewport = useCallback((update: React.SetStateAction<CorkboardViewport>) => {
    viewportRef.current = typeof update === 'function' ? update(viewportRef.current) : update;
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      commitViewport(viewportRef.current);
    });
  }, []);
  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
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
      x: CANVAS_SIZE / 2,
      y: CANVAS_SIZE / 2,
      zoom: 1.0,
    });
  }, []);

  const setCenter = useCallback((x: number, y: number) => {
    setViewport(prev => ({ ...prev, x, y }));
  }, []);

  // Desktop Mouse Wheel Zoom Handler
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - rect.width / 2;
    const offsetY = e.clientY - rect.top - rect.height / 2;
    const pixels = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rect.height : 1);
    setViewport(prev => {
      const zoom = clampZoom(prev.zoom * Math.exp(-pixels * 0.002));
      if (zoom === prev.zoom) return prev;
      return {
        zoom,
        x: prev.x + offsetX / prev.zoom - offsetX / zoom,
        y: prev.y + offsetY / prev.zoom - offsetY / zoom,
      };
    });
  }, [setViewport]);

  // Pointer / Mouse Drag Panning Handlers
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Pan from background or strings; cards and controls keep their own gestures.
    if (e.button !== 0 || multiTouch.current) return;
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
    if (Math.hypot(rawDx, rawDy) > 6) {
      dragStart.current.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    const dx = rawDx / viewportRef.current.zoom;
    const dy = rawDy / viewportRef.current.zoom;

    // Generous boundary padding (-100 to CANVAS_SIZE + 100) so edge cards are never clipped
    setViewport(prev => ({
      ...prev,
      x: Math.max(-100, Math.min(CANVAS_SIZE + 100, dragStart.current.startCamX - dx)),
      y: Math.max(-100, Math.min(CANVAS_SIZE + 100, dragStart.current.startCamY - dy)),
    }));
  }, [setViewport]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || multiTouch.current) return;
    isDragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already lost
    }

    // Double-tap zoom toggle or single-tap background selection dismissal
    if (!dragStart.current.moved && !(e.target as Element).closest('.corkboard-string, .corkboard-node-card, button')) {
      onTapBackground?.();
      const now = Date.now();
      if (now - lastTapTime.current < 320) {
        setViewport(prev => ({
          ...prev,
          zoom: prev.zoom >= 1.4 ? 1.0 : 1.5,
        }));
        lastTapTime.current = 0;
      } else {
        lastTapTime.current = now;
      }
    }
  }, [onTapBackground]);

  // Capture touch pointers before card drag handlers. One owner for the entire pinch,
  // including the remaining finger after the first finger lifts.
  const handleTouchPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'touch') return;
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
    setViewport({
      zoom,
      x: start.initialCamX + start.centroidX / start.initialZoom -
        ((t1.clientX + t2.clientX) / 2 - start.screenCenterX) / zoom,
      y: start.initialCamY + start.centroidY / start.initialZoom -
        ((t1.clientY + t2.clientY) / 2 - start.screenCenterY) / zoom,
    });
  };

  const handleTouchPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    touchPointers.current.delete(e.pointerId);
    if (!multiTouch.current) return;
    e.stopPropagation();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (touchPointers.current.size < 2) pinchStart.current = null;
    if (touchPointers.current.size === 0) {
      multiTouch.current = false;
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
      onPointerCancel: () => { isDragging.current = false; lastTapTime.current = 0; },
      onWheel: handleWheel,
      style: { touchAction: 'none' as const },
    },
  };
}

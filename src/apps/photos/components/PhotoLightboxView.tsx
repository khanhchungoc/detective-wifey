import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'motion/react';
import {
  IoChevronBack,
  IoInformationCircleOutline,
  IoInformationCircle,
} from 'react-icons/io5';
import type { PhotoItem } from '../types';
import { buildPhotoEvidenceItem } from '../data';
import { PhotoPreview } from './PhotoPreview';
import { StoryEvidenceTarget, type UniversalEvidenceItem } from '../../../features/investigation';
import { useSwipeBack } from '../../../shared/gestures/useSwipeBack';
import {
  clampImage,
  fitImage,
  zoomImage,
  type ImageBounds,
  type ImageView,
} from '../../../shared/gestures/imageViewport';

export interface PhotoOriginDelta {
  dx: number;
  dy: number;
  scale: number;
}

interface PhotoLightboxViewProps {
  photo: PhotoItem;
  prevPhoto?: PhotoItem | null;
  nextPhoto?: PhotoItem | null;
  caseId: string;
  husbandName: string;
  onBack: () => void;
  onToggleInfo: () => void;
  isInfoOpen: boolean;
  onTriggerEvidence: (item: UniversalEvidenceItem) => void;
  onShowToast?: (message: string) => void;
  originDelta?: PhotoOriginDelta | null;
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrevPhoto?: () => void;
  onNextPhoto?: () => void;
}

const IOS_SPRING = { type: 'spring' as const, stiffness: 360, damping: 32, mass: 0.9 };
const IOS_EASE = [0.4, 0, 0.2, 1] as const;
const DISMISS_DISTANCE = 90;
const DISMISS_VELOCITY = 0.45;
const BROWSE_DISTANCE = 60;
const BROWSE_VELOCITY = 0.35;
const SLIDE_GAP = 16;
const EDGE_SWIPE_BACK_ZONE = 28;
const MIN_RUBBER_ZOOM = 0.85;
const MAX_RUBBER_ZOOM = 5.5;

type GestureMode = 'idle' | 'dismiss' | 'pan' | 'pinch' | 'up' | 'horizontal';

export const PhotoLightboxView: React.FC<PhotoLightboxViewProps> = ({
  photo,
  prevPhoto = null,
  nextPhoto = null,
  caseId,
  husbandName,
  onBack,
  onToggleInfo,
  isInfoOpen,
  onTriggerEvidence,
  originDelta,
  hasPrev = false,
  hasNext = false,
  onPrevPhoto,
  onNextPhoto,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isZoomed, setIsZoomed] = useState(false);
  const [manipulating, setManipulating] = useState(false);
  const [dismissedBySwipe, setDismissedBySwipe] = useState(false);
  const [showAdjacentSlides, setShowAdjacentSlides] = useState(false);

  // Compositor-only motion values (zero React re-renders per frame)
  const photoX = useMotionValue(0);
  const photoY = useMotionValue(0);
  const photoScale = useMotionValue(1);
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const dragScale = useMotionValue(1);
  const dragBackdropOpacity = useMotionValue(1);
  const chromeOpacity = useMotionValue(1);

  const stageRef = useRef<HTMLDivElement>(null);
  const stageRectRef = useRef<{ left: number; top: number; width: number; height: number }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  const viewRef = useRef<ImageView>(fitImage);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureModeRef = useRef<GestureMode>('idle');
  const pressStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastMoveRef = useRef({ x: 0, y: 0, time: 0, vx: 0, vy: 0 });
  const movedRef = useRef(false);
  const wasPinchRef = useRef(false);
  const lastTapRef = useRef<{ time: number; x: number; y: number }>({ time: 0, x: 0, y: 0 });
  const activeAnimationsRef = useRef<Array<{ stop: () => void }>>([]);
  const isPagingRef = useRef(false);

  const stopActiveAnimations = useCallback(() => {
    isPagingRef.current = false;
    for (let i = 0; i < activeAnimationsRef.current.length; i += 1) {
      activeAnimationsRef.current[i].stop();
    }
    activeAnimationsRef.current.length = 0;
  }, []);

  const readCachedBounds = useCallback((): ImageBounds => {
    const r = stageRectRef.current;
    return {
      width: r.width,
      height: r.height,
      imageWidth: r.width,
      imageHeight: r.height,
    };
  }, []);

  const measureStage = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    stageRectRef.current = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }, []);

  const syncZoomFlag = useCallback((zoom: number) => {
    const zoomed = zoom > 1.05;
    setIsZoomed((prev) => (prev === zoomed ? prev : zoomed));
  }, []);

  const setViewImmediate = useCallback((next: ImageView) => {
    viewRef.current = next;
    photoX.set(next.x);
    photoY.set(next.y);
    photoScale.set(next.zoom);
    syncZoomFlag(next.zoom);
  }, [photoX, photoY, photoScale, syncZoomFlag]);

  const animateToView = useCallback((next: ImageView) => {
    stopActiveAnimations();
    viewRef.current = next;
    syncZoomFlag(next.zoom);
    if (prefersReducedMotion) {
      photoX.set(next.x);
      photoY.set(next.y);
      photoScale.set(next.zoom);
      return;
    }
    activeAnimationsRef.current = [
      animate(photoX, next.x, IOS_SPRING),
      animate(photoY, next.y, IOS_SPRING),
      animate(photoScale, next.zoom, IOS_SPRING),
    ];
  }, [photoX, photoY, photoScale, prefersReducedMotion, stopActiveAnimations, syncZoomFlag]);

  const resetSwipeVisuals = useCallback(() => {
    if (prefersReducedMotion) {
      dragX.set(0);
      dragY.set(0);
      dragScale.set(1);
      dragBackdropOpacity.set(1);
      chromeOpacity.set(1);
      setShowAdjacentSlides(false);
      return;
    }
    const xControl = animate(dragX, 0, IOS_SPRING);
    activeAnimationsRef.current.push(xControl);
    void xControl.then(() => {
      if (gestureModeRef.current !== 'horizontal' && !isPagingRef.current) {
        setShowAdjacentSlides(false);
      }
    });
    animate(dragY, 0, IOS_SPRING);
    animate(dragScale, 1, IOS_SPRING);
    animate(dragBackdropOpacity, 1, { duration: 0.22, ease: IOS_EASE });
    animate(chromeOpacity, 1, { duration: 0.2, ease: IOS_EASE });
  }, [dragX, dragY, dragScale, dragBackdropOpacity, chromeOpacity, prefersReducedMotion]);

  // Reset zoom and drag offsets synchronously before paint when photo.id swaps after a slide completes
  useLayoutEffect(() => {
    stopActiveAnimations();
    isPagingRef.current = false;
    viewRef.current = fitImage;
    photoX.set(0);
    photoY.set(0);
    photoScale.set(1);
    dragX.set(0);
    dragY.set(0);
    dragScale.set(1);
    dragBackdropOpacity.set(1);
    chromeOpacity.set(1);
    setIsZoomed(false);
    setManipulating(false);
    setShowAdjacentSlides(false);
    gestureModeRef.current = 'idle';
  }, [photo.id, stopActiveAnimations, photoX, photoY, photoScale, dragX, dragY, dragScale, dragBackdropOpacity, chromeOpacity]);

  const commitSlideBrowse = useCallback((direction: -1 | 1) => {
    const commit = direction > 0 ? onNextPhoto : onPrevPhoto;
    if (!commit || isPagingRef.current) return;
    if (prefersReducedMotion) {
      commit();
      return;
    }
    if (stageRectRef.current.width === 0) measureStage();
    const stride = (stageRectRef.current.width || 390) + SLIDE_GAP;
    const targetX = direction > 0 ? -stride : stride;
    isPagingRef.current = true;
    setShowAdjacentSlides(true);
    const controls = animate(dragX, targetX, { duration: 0.24, ease: IOS_EASE });
    activeAnimationsRef.current.push(controls);
    void controls.then(() => {
      if (isPagingRef.current) {
        commit();
      }
    });
  }, [dragX, measureStage, onNextPhoto, onPrevPhoto, prefersReducedMotion]);

  // Measure viewport once on mount and on resize (never during pointer move)
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    measureStage();
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
        measureStage();
        const clamped = clampImage(viewRef.current, readCachedBounds());
        setViewImmediate(clamped);
      })
      : null;
    observer?.observe(stage);

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (stageRectRef.current.width === 0) measureStage();
      const rect = stageRectRef.current;
      const point = {
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2,
      };
      const factor = Math.exp(-Math.max(-100, Math.min(100, event.deltaY)) * 0.003);
      const next = zoomImage(viewRef.current, viewRef.current.zoom * factor, point, readCachedBounds());
      stopActiveAnimations();
      setViewImmediate(next);
    };

    stage.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      stage.removeEventListener('wheel', handleWheel);
      observer?.disconnect();
    };
  }, [measureStage, readCachedBounds, setViewImmediate, stopActiveAnimations]);

  // Keyboard shortcuts (Escape to close, +/-/0 to zoom)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        if (isInfoOpen) {
          onToggleInfo();
        } else {
          onBack();
        }
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        animateToView(zoomImage(viewRef.current, viewRef.current.zoom + 0.5, { x: 0, y: 0 }, readCachedBounds()));
      } else if (event.key === '-') {
        event.preventDefault();
        animateToView(zoomImage(viewRef.current, viewRef.current.zoom - 0.5, { x: 0, y: 0 }, readCachedBounds()));
      } else if (event.key === '0') {
        event.preventDefault();
        animateToView(fitImage);
      } else if (event.key === 'ArrowLeft' && !isInfoOpen && hasPrev && onPrevPhoto) {
        event.preventDefault();
        commitSlideBrowse(-1);
      } else if (event.key === 'ArrowRight' && !isInfoOpen && hasNext && onNextPhoto) {
        event.preventDefault();
        commitSlideBrowse(1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isInfoOpen, onToggleInfo, onBack, animateToView, readCachedBounds, hasPrev, hasNext, onPrevPhoto, onNextPhoto, commitSlideBrowse]);

  // Swipe right from left edge to go back to grid (disabled while zoomed or info open)
  const swipeBackHandlers = useSwipeBack({
    enabled: !isZoomed && !isInfoOpen,
    maxStartDistance: EDGE_SWIPE_BACK_ZONE,
    onBack: (e?: unknown) => {
      if (e && typeof (e as Event).stopPropagation === 'function') {
        (e as Event).stopPropagation();
      }
      onBack();
    },
  });

  const handleDoubleTapAt = useCallback((clientX: number, clientY: number) => {
    if (stageRectRef.current.width === 0) measureStage();
    const bounds = readCachedBounds();
    if (viewRef.current.zoom > 1.05) {
      animateToView(fitImage);
      return;
    }
    const rect = stageRectRef.current;
    const point = {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    };
    animateToView(zoomImage(fitImage, 2.5, point, bounds));
  }, [measureStage, readCachedBounds, animateToView]);

  // Pointer gesture handlers (pinch-to-zoom, 2D pan, iOS swipe-down dismiss, swipe-up EXIF, double-tap)
  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (stageRectRef.current.width === 0) measureStage();
    stopActiveAnimations();

    if (pointersRef.current.size === 0) {
      if (viewRef.current.zoom <= 1.05 && event.clientX - stageRectRef.current.left <= EDGE_SWIPE_BACK_ZONE) {
        return;
      }
      pressStartRef.current = { x: event.clientX, y: event.clientY, time: performance.now() };
      lastMoveRef.current = { x: event.clientX, y: event.clientY, time: performance.now(), vx: 0, vy: 0 };
      movedRef.current = false;
      wasPinchRef.current = false;
      gestureModeRef.current = viewRef.current.zoom > 1.05 ? 'pan' : 'idle';
    }

    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Ignore synthetic or unsupported pointer capture
    }

    if (pointersRef.current.size >= 2) {
      gestureModeRef.current = 'pinch';
      wasPinchRef.current = true;
      movedRef.current = true;
      setManipulating(true);
      setShowAdjacentSlides(false);
      resetSwipeVisuals();
      event.stopPropagation();
    } else if (viewRef.current.zoom > 1.05) {
      event.stopPropagation();
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const prev = pointersRef.current.get(event.pointerId);
    if (!prev) return;

    const now = performance.now();
    const pointerCount = pointersRef.current.size;

    if (pointerCount === 2) {
      // Collect before/after without extra allocations beyond 2-point tuple
      const entries = Array.from(pointersRef.current.entries());
      const [id0, p0Before] = entries[0];
      const [, p1Before] = entries[1];
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const p0After = id0 === event.pointerId ? { x: event.clientX, y: event.clientY } : p0Before;
      const p1After = id0 === event.pointerId ? p1Before : { x: event.clientX, y: event.clientY };

      const oldDist = Math.hypot(p1Before.x - p0Before.x, p1Before.y - p0Before.y);
      const newDist = Math.hypot(p1After.x - p0After.x, p1After.y - p0After.y);
      if (oldDist < 1) return;

      const rect = stageRectRef.current;
      const oldCenterX = (p0Before.x + p1Before.x) / 2;
      const oldCenterY = (p0Before.y + p1Before.y) / 2;
      const newCenterX = (p0After.x + p1After.x) / 2;
      const newCenterY = (p0After.y + p1After.y) / 2;

      const current = viewRef.current;
      const rawZoom = Math.max(MIN_RUBBER_ZOOM, Math.min(MAX_RUBBER_ZOOM, current.zoom * (newDist / oldDist)));
      const ratio = rawZoom / current.zoom;
      const pointX = oldCenterX - rect.left - rect.width / 2;
      const pointY = oldCenterY - rect.top - rect.height / 2;
      const nextX = pointX - (pointX - current.x) * ratio + (newCenterX - oldCenterX);
      const nextY = pointY - (pointY - current.y) * ratio + (newCenterY - oldCenterY);

      if (rawZoom >= 1) {
        const clamped = clampImage({ zoom: rawZoom, x: nextX, y: nextY }, readCachedBounds());
        setViewImmediate({ zoom: rawZoom, x: clamped.x, y: clamped.y });
      } else {
        // Rubber-band slightly below 1x during active pinch
        setViewImmediate({ zoom: rawZoom, x: nextX * 0.4, y: nextY * 0.4 });
      }
      event.stopPropagation();
      return;
    }

    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    const dxTotal = event.clientX - pressStartRef.current.x;
    const dyTotal = event.clientY - pressStartRef.current.y;
    if (!movedRef.current && Math.hypot(dxTotal, dyTotal) > 8) {
      movedRef.current = true;
      setManipulating(true);
    }

    if (gestureModeRef.current === 'pan' || viewRef.current.zoom > 1.05) {
      const next = clampImage(
        {
          zoom: viewRef.current.zoom,
          x: viewRef.current.x + (event.clientX - prev.x),
          y: viewRef.current.y + (event.clientY - prev.y),
        },
        readCachedBounds(),
      );
      setViewImmediate(next);
      event.stopPropagation();
      return;
    }

    if (isInfoOpen) return;

    // Decide single-finger gesture direction once past deadzone
    if (gestureModeRef.current === 'idle' && movedRef.current) {
      if (dyTotal > 0 && dyTotal > Math.abs(dxTotal) * 1.05) {
        gestureModeRef.current = 'dismiss';
        setShowAdjacentSlides(false);
      } else if (dyTotal < 0 && Math.abs(dyTotal) > Math.abs(dxTotal) * 1.15) {
        gestureModeRef.current = 'up';
      } else {
        gestureModeRef.current = 'horizontal';
        setShowAdjacentSlides(true);
      }
    }

    if (gestureModeRef.current === 'dismiss') {
      const dt = Math.max(1, now - lastMoveRef.current.time);
      lastMoveRef.current = {
        x: event.clientX,
        y: event.clientY,
        time: now,
        vx: (event.clientX - lastMoveRef.current.x) / dt,
        vy: (event.clientY - lastMoveRef.current.y) / dt,
      };
      const clampedDy = Math.max(-24, dyTotal);
      const progress = Math.max(0, Math.min(1, clampedDy / 260));
      dragX.set(dxTotal * 0.45);
      dragY.set(clampedDy);
      dragScale.set(1 - progress * 0.35);
      dragBackdropOpacity.set(1 - progress * 0.85);
      chromeOpacity.set(Math.max(0, 1 - progress * 3));
      event.stopPropagation();
    } else if (gestureModeRef.current === 'horizontal') {
      const dt = Math.max(1, now - lastMoveRef.current.time);
      lastMoveRef.current = {
        x: event.clientX,
        y: event.clientY,
        time: now,
        vx: (event.clientX - lastMoveRef.current.x) / dt,
        vy: (event.clientY - lastMoveRef.current.y) / dt,
      };
      const canMove = (dxTotal < 0 && hasNext) || (dxTotal > 0 && hasPrev);
      dragX.set(canMove ? dxTotal : dxTotal * 0.28);
      event.stopPropagation();
    }
  };

  const finishPointer = (event: React.PointerEvent<HTMLElement>, cancelled: boolean) => {
    try {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }
    } catch {
      // Ignore if pointer capture already released
    }
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.delete(event.pointerId);

    const remaining = pointersRef.current.size;

    // Transition from 2-finger pinch down to 1 finger: snap bounds cleanly
    if (gestureModeRef.current === 'pinch' && remaining === 1) {
      const snapped = viewRef.current.zoom < 1.05
        ? fitImage
        : clampImage(viewRef.current, readCachedBounds());
      animateToView(snapped);
      gestureModeRef.current = snapped.zoom > 1.05 ? 'pan' : 'idle';
      return;
    }

    if (remaining > 0) return;

    const mode = gestureModeRef.current;
    gestureModeRef.current = 'idle';
    setManipulating(false);

    if (mode === 'pinch' || viewRef.current.zoom < 1 || viewRef.current.zoom > 5) {
      const target = viewRef.current.zoom < 1.05
        ? fitImage
        : clampImage(viewRef.current, readCachedBounds());
      animateToView(target);
      return;
    }

    if (mode === 'dismiss') {
      const dyTotal = event.clientY - pressStartRef.current.y;
      const shouldDismiss = !cancelled && (dyTotal >= DISMISS_DISTANCE || lastMoveRef.current.vy > DISMISS_VELOCITY);
      if (shouldDismiss) {
        setShowAdjacentSlides(false);
        setDismissedBySwipe(true);
        dragBackdropOpacity.set(0);
        chromeOpacity.set(0);
        onBack();
      } else {
        resetSwipeVisuals();
      }
      event.stopPropagation();
      return;
    }

    if (mode === 'horizontal') {
      const dxTotal = event.clientX - pressStartRef.current.x;
      if (!cancelled && (dxTotal <= -BROWSE_DISTANCE || lastMoveRef.current.vx < -BROWSE_VELOCITY) && hasNext && onNextPhoto) {
        commitSlideBrowse(1);
      } else if (!cancelled && (dxTotal >= BROWSE_DISTANCE || lastMoveRef.current.vx > BROWSE_VELOCITY) && hasPrev && onPrevPhoto) {
        commitSlideBrowse(-1);
      } else {
        resetSwipeVisuals();
      }
      event.stopPropagation();
      return;
    }

    if (mode === 'up' && !cancelled) {
      const dyTotal = event.clientY - pressStartRef.current.y;
      const dxTotal = Math.abs(event.clientX - pressStartRef.current.x);
      if (dyTotal < -50 && dxTotal < 70) {
        onToggleInfo();
      }
      return;
    }

    // Detect clean double-tap (no drag, no pinch)
    if (!cancelled && !movedRef.current && !wasPinchRef.current) {
      const now = Date.now();
      const prevTap = lastTapRef.current;
      if (now - prevTap.time < 350 && Math.hypot(event.clientX - prevTap.x, event.clientY - prevTap.y) < 44) {
        lastTapRef.current = { time: 0, x: 0, y: 0 };
        handleDoubleTapAt(event.clientX, event.clientY);
      } else {
        lastTapRef.current = { time: now, x: event.clientX, y: event.clientY };
      }
    }
  };

  // Stop touch propagation so shell-level swipe-back never hijacks photo browsing/panning
  const handleTouchGuard = (event: React.TouchEvent<HTMLElement>) => {
    if (
      event.touches.length === 1
      && viewRef.current.zoom <= 1.05
      && gestureModeRef.current === 'idle'
    ) {
      const rect = stageRectRef.current;
      const startX = event.touches[0].clientX;
      if (rect.width > 0 && startX - rect.left <= EDGE_SWIPE_BACK_ZONE) {
        return;
      }
    }
    event.stopPropagation();
  };

  const evidenceItem = buildPhotoEvidenceItem(photo, caseId, husbandName, 'lightbox');

  const heroInitial = originDelta
    ? { x: originDelta.dx, y: originDelta.dy, scale: originDelta.scale, opacity: 0.85 }
    : { x: 0, y: 24, scale: 0.9, opacity: 0 };

  const heroExit = dismissedBySwipe
    ? { y: 120, scale: 0.72, opacity: 0, transition: { duration: 0.2, ease: IOS_EASE } }
    : originDelta
      ? { x: originDelta.dx, y: originDelta.dy, scale: originDelta.scale, opacity: 0, transition: { duration: 0.24, ease: IOS_EASE } }
      : { y: 24, scale: 0.9, opacity: 0, transition: { duration: 0.2, ease: IOS_EASE } };

  return (
    <motion.div
      {...swipeBackHandlers}
      data-photo-lightbox
      onTouchStart={(e) => {
        swipeBackHandlers.onTouchStart(e);
        e.stopPropagation();
      }}
      onTouchMove={(e) => {
        swipeBackHandlers.onTouchMove(e);
        e.stopPropagation();
      }}
      onTouchEnd={(e) => {
        swipeBackHandlers.onTouchEnd(e);
        e.stopPropagation();
      }}
      onPointerDown={(e) => {
        swipeBackHandlers.onPointerDown(e);
        e.stopPropagation();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: IOS_EASE }}
      className="absolute inset-0 z-30 flex flex-col text-white select-none overflow-hidden"
    >
      {/* Interactive Black Backdrop (fades dynamically during swipe-down to reveal grid) */}
      <motion.div
        aria-hidden="true"
        data-lightbox-backdrop
        className="absolute inset-0 bg-[#000000] pointer-events-none"
        style={{ opacity: dragBackdropOpacity }}
      />

      {/* Top iOS Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: IOS_EASE }}
        style={{ opacity: chromeOpacity }}
        className="relative h-14 px-3 flex items-center justify-between border-b border-white/10 bg-black/90 shrink-0 z-20"
      >
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={() => {
            setShowAdjacentSlides(false);
            onBack();
          }}
          className="flex items-center gap-1 min-w-[44px] min-h-[44px] px-2 text-ios-subheadline font-semibold text-[#2979FF] rounded-lg active:scale-95 transition-transform duration-100"
          aria-label="Quay lại Thư viện"
        >
          <IoChevronBack className="w-5 h-5" />
          <span>Thư viện</span>
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 text-ios-subheadline font-medium text-white/90 truncate max-w-[180px] pointer-events-none">
          {photo.date || 'Ảnh'}
        </span>

        <button
          type="button"
          onClick={onToggleInfo}
          onPointerDown={(e) => e.stopPropagation()}
          className={`relative -mr-2 min-w-[52px] min-h-[52px] px-3 flex items-center justify-center rounded-full cursor-pointer touch-manipulation transition-colors active:scale-95 after:absolute after:-inset-2 after:content-[''] ${
            isInfoOpen ? 'text-[#2979FF] bg-white/10' : 'text-white/85 hover:text-white'
          }`}
          aria-label="Thông tin ảnh"
        >
          {isInfoOpen ? (
            <IoInformationCircle className="w-[26px] h-[26px]" />
          ) : (
            <IoInformationCircleOutline className="w-[26px] h-[26px]" />
          )}
        </button>
      </motion.header>

      {/* Main Photo Viewport */}
      <main
        ref={stageRef}
        data-photo-stage
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        style={{ touchAction: 'none', cursor: isZoomed ? 'grab' : 'default' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => finishPointer(e, false)}
        onPointerCancel={(e) => finishPointer(e, true)}
        onTouchStart={handleTouchGuard}
        onTouchMove={handleTouchGuard}
        onTouchEnd={handleTouchGuard}
      >
        <StoryEvidenceTarget
          item={evidenceItem}
          disabled={manipulating}
          onTriggerEvidence={onTriggerEvidence}
          className="w-full h-full flex items-center justify-center"
        >
          {/* Outer Hero Expand/Shrink Container */}
          <motion.div
            initial={heroInitial}
            animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            exit={heroExit}
            transition={IOS_SPRING}
            style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}
            className="relative w-full h-full flex items-center justify-center"
          >
            {/* Middle Swipe-Down Dismiss / 3-Slide Horizontal Pager Container */}
            <motion.div
              data-lightbox-drag-layer
              className="relative w-full h-full flex items-center justify-center"
              style={{
                x: dragX,
                y: dragY,
                scale: dragScale,
                willChange: 'transform',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* Previous Adjacent Photo Slot (rendered only during horizontal paging so it never peeks during open/dismiss/close) */}
              {showAdjacentSlides && prevPhoto && !isZoomed && (
                <div
                  aria-hidden="true"
                  data-lightbox-prev-slide
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ transform: `translate3d(calc(-100% - ${SLIDE_GAP}px), 0, 0)` }}
                >
                  <PhotoPreview
                    photo={prevPhoto}
                    fit="contain"
                    className="w-full h-full"
                    zoomLevel={1}
                  />
                </div>
              )}

              {/* Center Active Photo (Pinch-Zoom & 2D Pan Container) */}
              <motion.div
                data-lightbox-zoom-layer
                className="relative w-full h-full flex items-center justify-center overflow-hidden"
                style={{
                  x: photoX,
                  y: photoY,
                  scale: photoScale,
                  transformOrigin: 'center center',
                  willChange: manipulating ? 'transform' : 'auto',
                }}
              >
                <PhotoPreview
                  photo={photo}
                  fit="contain"
                  className="w-full h-full"
                  zoomLevel={1}
                />
              </motion.div>

              {/* Next Adjacent Photo Slot (rendered only during horizontal paging so it never peeks during open/dismiss/close) */}
              {showAdjacentSlides && nextPhoto && !isZoomed && (
                <div
                  aria-hidden="true"
                  data-lightbox-next-slide
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ transform: `translate3d(calc(100% + ${SLIDE_GAP}px), 0, 0)` }}
                >
                  <PhotoPreview
                    photo={nextPhoto}
                    fit="contain"
                    className="w-full h-full"
                    zoomLevel={1}
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        </StoryEvidenceTarget>
      </main>
    </motion.div>
  );
};

export default PhotoLightboxView;

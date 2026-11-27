import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from 'motion/react';
import {
  IoChevronBack,
  IoInformationCircleOutline,
  IoInformationCircle,
  IoSparklesOutline,
} from 'react-icons/io5';
import type { PhotoItem } from '../types';
import { buildPhotoEvidenceItem } from '../data';
import { PhotoPreview } from './PhotoPreview';
import { StoryEvidenceTarget, type UniversalEvidenceItem } from '../../../features/investigation';
import { useSwipeBack } from '../../../shared/gestures/useSwipeBack';
import {
  clampImage,
  fitImage,
  focusImagePoint,
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
  caseId: string;
  husbandName: string;
  onBack: () => void;
  onToggleInfo: () => void;
  isInfoOpen: boolean;
  onTriggerEvidence: (item: UniversalEvidenceItem) => void;
  onShowToast?: (message: string) => void;
  originDelta?: PhotoOriginDelta | null;
}

const IOS_SPRING = { type: 'spring' as const, stiffness: 360, damping: 32, mass: 0.9 };
const IOS_EASE = [0.4, 0, 0.2, 1] as const;
const DISMISS_DISTANCE = 90;
const DISMISS_VELOCITY = 0.45;
const MIN_RUBBER_ZOOM = 0.85;
const MAX_RUBBER_ZOOM = 5.5;

type GestureMode = 'idle' | 'dismiss' | 'pan' | 'pinch' | 'up' | 'horizontal';

export const PhotoLightboxView: React.FC<PhotoLightboxViewProps> = ({
  photo,
  caseId,
  husbandName,
  onBack,
  onToggleInfo,
  isInfoOpen,
  onTriggerEvidence,
  originDelta,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isZoomed, setIsZoomed] = useState(false);
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [manipulating, setManipulating] = useState(false);
  const [dismissedBySwipe, setDismissedBySwipe] = useState(false);

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
  const lastMoveRef = useRef({ y: 0, time: 0, vy: 0 });
  const movedRef = useRef(false);
  const wasPinchRef = useRef(false);
  const lastTapRef = useRef<{ time: number; x: number; y: number }>({ time: 0, x: 0, y: 0 });
  const activeAnimationsRef = useRef<Array<{ stop: () => void }>>([]);

  const stopActiveAnimations = useCallback(() => {
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
    if (!zoomed) {
      setIsMagnifierActive(false);
    }
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
      return;
    }
    animate(dragX, 0, IOS_SPRING);
    animate(dragY, 0, IOS_SPRING);
    animate(dragScale, 1, IOS_SPRING);
    animate(dragBackdropOpacity, 1, { duration: 0.22, ease: IOS_EASE });
    animate(chromeOpacity, 1, { duration: 0.2, ease: IOS_EASE });
  }, [dragX, dragY, dragScale, dragBackdropOpacity, chromeOpacity, prefersReducedMotion]);

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
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isInfoOpen, onToggleInfo, onBack, animateToView, readCachedBounds]);

  // Swipe right from left edge to go back to grid (disabled while zoomed or info open)
  const swipeBackHandlers = useSwipeBack({
    enabled: !isZoomed && !isInfoOpen,
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
      setIsMagnifierActive(false);
      animateToView(fitImage);
      return;
    }
    if (photo.hasForensicHotspot && photo.hotspotCoordinates) {
      setIsMagnifierActive(true);
      animateToView(
        focusImagePoint(
          { x: photo.hotspotCoordinates.x, y: photo.hotspotCoordinates.y },
          photo.hotspotCoordinates.zoomLevel || 2.5,
          bounds,
        ),
      );
      return;
    }
    const rect = stageRectRef.current;
    const point = {
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2,
    };
    animateToView(zoomImage(fitImage, 2.5, point, bounds));
  }, [photo, measureStage, readCachedBounds, animateToView]);

  const toggleMagnifier = useCallback(() => {
    if (stageRectRef.current.width === 0) measureStage();
    if (!isMagnifierActive) {
      setIsMagnifierActive(true);
      const targetZoom = photo.hotspotCoordinates?.zoomLevel || 2.5;
      if (photo.hotspotCoordinates) {
        animateToView(
          focusImagePoint(
            { x: photo.hotspotCoordinates.x, y: photo.hotspotCoordinates.y },
            targetZoom,
            readCachedBounds(),
          ),
        );
      } else {
        animateToView(zoomImage(fitImage, targetZoom, { x: 0, y: 0 }, readCachedBounds()));
      }
    } else {
      setIsMagnifierActive(false);
      animateToView(fitImage);
    }
  }, [isMagnifierActive, photo, measureStage, readCachedBounds, animateToView]);

  // Pointer gesture handlers (pinch-to-zoom, 2D pan, iOS swipe-down dismiss, swipe-up EXIF, double-tap)
  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (stageRectRef.current.width === 0) measureStage();
    stopActiveAnimations();

    if (pointersRef.current.size === 0) {
      pressStartRef.current = { x: event.clientX, y: event.clientY, time: performance.now() };
      lastMoveRef.current = { y: event.clientY, time: performance.now(), vy: 0 };
      movedRef.current = false;
      wasPinchRef.current = false;
      gestureModeRef.current = viewRef.current.zoom > 1.05 ? 'pan' : 'idle';
    }

    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointersRef.current.size >= 2) {
      gestureModeRef.current = 'pinch';
      wasPinchRef.current = true;
      movedRef.current = true;
      setManipulating(true);
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
      } else if (dyTotal < 0 && Math.abs(dyTotal) > Math.abs(dxTotal) * 1.15) {
        gestureModeRef.current = 'up';
      } else {
        gestureModeRef.current = 'horizontal';
      }
    }

    if (gestureModeRef.current === 'dismiss') {
      const dt = Math.max(1, now - lastMoveRef.current.time);
      lastMoveRef.current = {
        y: event.clientY,
        time: now,
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
    }
  };

  const finishPointer = (event: React.PointerEvent<HTMLElement>, cancelled: boolean) => {
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
      if (now - prevTap.time < 280 && Math.hypot(event.clientX - prevTap.x, event.clientY - prevTap.y) < 40) {
        lastTapRef.current = { time: 0, x: 0, y: 0 };
        handleDoubleTapAt(event.clientX, event.clientY);
      } else {
        lastTapRef.current = { time: now, x: event.clientX, y: event.clientY };
      }
    }
  };

  // Stop touch propagation to useSwipeBack when pinching, zooming, or dragging vertically
  const handleTouchGuard = (event: React.TouchEvent<HTMLElement>) => {
    if (
      event.touches.length > 1
      || viewRef.current.zoom > 1.05
      || gestureModeRef.current === 'dismiss'
      || gestureModeRef.current === 'pinch'
      || gestureModeRef.current === 'pan'
    ) {
      event.stopPropagation();
    }
  };

  const evidenceItem = buildPhotoEvidenceItem(photo, caseId, husbandName, 'lightbox');

  const hotspot = photo.hotspotCoordinates;
  const isHotspotRevealed = (isMagnifierActive || isZoomed) && photo.hasForensicHotspot && hotspot;

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
        className="relative h-14 px-3 flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-md shrink-0 z-20"
      >
        <button
          type="button"
          onClick={onBack}
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
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors active:scale-95 ${
            isInfoOpen ? 'text-[#2979FF] bg-white/10' : 'text-white/80 hover:text-white'
          }`}
          aria-label="Thông tin ảnh"
        >
          {isInfoOpen ? (
            <IoInformationCircle className="w-6 h-6" />
          ) : (
            <IoInformationCircleOutline className="w-6 h-6" />
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
            className="relative w-full h-full flex items-center justify-center"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Middle Swipe-Down Dismiss Container */}
            <motion.div
              data-lightbox-drag-layer
              className="relative w-full h-full flex items-center justify-center"
              style={{
                x: dragX,
                y: dragY,
                scale: dragScale,
                willChange: 'transform',
              }}
            >
              {/* Inner Pinch-Zoom & 2D Pan Container (keeps hotspot ring locked to photo) */}
              <motion.div
                data-lightbox-zoom-layer
                className="relative w-full h-full flex items-center justify-center"
                style={{
                  x: photoX,
                  y: photoY,
                  scale: photoScale,
                  transformOrigin: 'center center',
                  willChange: 'transform',
                }}
              >
                <PhotoPreview
                  photo={photo}
                  className="w-full h-full"
                  zoomLevel={1}
                />

                {/* Forensic Cyan Ring Hotspot Indicator */}
                <AnimatePresence>
                  {isHotspotRevealed && (
                    <motion.div
                      key="hotspot-ring"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={IOS_SPRING}
                      className="absolute pointer-events-none z-10"
                      style={{
                        left: `${hotspot.x}%`,
                        top: `${hotspot.y}%`,
                        translateX: '-50%',
                        translateY: '-50%',
                      }}
                    >
                      <div className="w-14 h-14 rounded-full border-2 border-[#00E5FF] shadow-[0_0_15px_#00E5FF] animate-pulse flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        </StoryEvidenceTarget>

        {/* Forensic Hotspot Callout Box */}
        <AnimatePresence>
          {isHotspotRevealed && photo.hotspotClueDescription && (
            <motion.div
              key="hotspot-callout"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22, ease: IOS_EASE }}
              style={{ opacity: chromeOpacity }}
              className="absolute bottom-6 inset-x-4 z-20 p-3 rounded-2xl bg-black/85 backdrop-blur-md border border-[#00E5FF]/40 shadow-2xl text-left pointer-events-none"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#00E5FF] mb-1">
                <IoSparklesOutline className="w-3.5 h-3.5" />
                <span>Phát hiện chi tiết pháp y</span>
              </div>
              <p className="text-ios-caption-1 text-slate-200">
                {photo.hotspotClueDescription}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Forensic Magnifier Action Button (AI Clean Up / Spatial Reframing) */}
        {photo.hasForensicHotspot && (
          <motion.button
            type="button"
            style={{ opacity: chromeOpacity }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              toggleMagnifier();
            }}
            className={`absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-colors active:scale-95 min-h-[44px] ${
              isMagnifierActive
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]'
                : 'bg-[#1C1C1E]/80 text-white/90 border-white/20 hover:text-white'
            }`}
          >
            <IoSparklesOutline className="w-3.5 h-3.5" />
            <span>{isMagnifierActive ? 'Tắt kính lúp' : 'Bật kính lúp'}</span>
          </motion.button>
        )}
      </main>
    </motion.div>
  );
};

export default PhotoLightboxView;

import React, { useCallback, useLayoutEffect, useRef } from 'react';
import { useSwipeBack } from '../gestures/useSwipeBack';

const SLIDE_MS = 280;
const SLIDE_EASE = 'cubic-bezier(0.25, 0.1, 0.25, 1)';

const isReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

export interface SlideStackViewProps {
  /** Always-mounted underlying screen (list or root view). */
  base: React.ReactNode;
  /** Identity key for the active detail screen, or null when at base. */
  detailKey: string | null;
  /** Render the pushed detail screen; receives `requestClose` for animated back-button dismissal. */
  renderDetail: (requestClose: () => void) => React.ReactNode;
  /** Called after the slide-out animation completes to unmount the detail screen. */
  onDismissDetail: () => void;
  /** Disable swipe-back when a modal/sheet/viewer is open above the detail screen. */
  swipeEnabled?: boolean;
  /** Set false when revealing a lower detail screen without replaying slide-in. */
  animateEnter?: boolean;
  /** Disable interaction on the base layer (in addition to when detail is open). */
  baseInert?: boolean;
  className?: string;
}

/**
 * Canonical 2-layer push/pop container for virtual apps.
 * Keeps the base screen mounted at z-10 behind the pushed detail screen at z-20, animating
 * strictly on the GPU compositor via WAAPI with live swipe-back reveal (zero View Transition
 * blackouts, zero blank white swipe-back background, zero first-frame layer promotion flicker).
 */
export const SlideStackView: React.FC<SlideStackViewProps> = ({
  base,
  detailKey,
  renderDetail,
  onDismissDetail,
  swipeEnabled = true,
  animateEnter = true,
  baseInert = false,
  className = '',
}) => {
  const detailLayerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const swipeProgressRef = useRef(0);
  const swipeDisplacementRef = useRef(0);
  const closingRef = useRef(false);
  const activeAnimsRef = useRef<Animation[]>([]);
  const onDismissRef = useRef(onDismissDetail);
  onDismissRef.current = onDismissDetail;

  const cancelActiveAnims = useCallback(() => {
    for (const anim of activeAnimsRef.current) {
      anim.cancel();
    }
    activeAnimsRef.current = [];
  }, []);

  useLayoutEffect(() => {
    if (!detailKey) return undefined;
    closingRef.current = false;
    swipeProgressRef.current = 0;
    swipeDisplacementRef.current = 0;
    cancelActiveAnims();

    const detailEl = detailLayerRef.current;
    const scrimEl = scrimRef.current;
    if (detailEl) {
      detailEl.style.pointerEvents = '';
      detailEl.style.transform = '';
    }
    if (scrimEl) scrimEl.style.opacity = '1';

    if (!animateEnter || isReducedMotion() || !detailEl || typeof detailEl.animate !== 'function') {
      return undefined;
    }

    const anims: Animation[] = [
      detailEl.animate(
        [{ transform: 'translate3d(100%, 0, 0)' }, { transform: 'translate3d(0, 0, 0)' }],
        { duration: SLIDE_MS, easing: SLIDE_EASE },
      ),
    ];
    if (scrimEl && typeof scrimEl.animate === 'function') {
      anims.push(scrimEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: SLIDE_MS, easing: SLIDE_EASE }));
    }
    activeAnimsRef.current = anims;
    return () => cancelActiveAnims();
  }, [detailKey, animateEnter, cancelActiveAnims]);

  const handleSwipeProgress = useCallback(
    (progress: number, displacement: number) => {
      if (activeAnimsRef.current.length > 0) {
        cancelActiveAnims();
      }
      swipeProgressRef.current = progress;
      swipeDisplacementRef.current = displacement;
      if (scrimRef.current) {
        scrimRef.current.style.opacity = String(Math.max(0, 1 - progress));
      }
    },
    [cancelActiveAnims],
  );

  const handleSwipeEnd = useCallback((committed: boolean) => {
    if (committed) return;
    const fromOpacity = Math.max(0, 1 - swipeProgressRef.current);
    swipeProgressRef.current = 0;
    swipeDisplacementRef.current = 0;
    const scrimEl = scrimRef.current;
    if (!scrimEl) return;
    scrimEl.style.opacity = '1';
    if (!isReducedMotion() && typeof scrimEl.animate === 'function' && fromOpacity < 1) {
      scrimEl.animate([{ opacity: fromOpacity }, { opacity: 1 }], { duration: SLIDE_MS, easing: SLIDE_EASE });
    }
  }, []);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    const displacementPx = swipeDisplacementRef.current;
    const progress = swipeProgressRef.current;
    swipeProgressRef.current = 0;
    swipeDisplacementRef.current = 0;

    const detailEl = detailLayerRef.current;
    const scrimEl = scrimRef.current;
    if (isReducedMotion() || !detailEl || typeof detailEl.animate !== 'function') {
      onDismissRef.current();
      return;
    }

    closingRef.current = true;
    cancelActiveAnims();
    detailEl.style.pointerEvents = 'none';

    const innerSurface = detailEl.firstElementChild;
    if (innerSurface instanceof HTMLElement) {
      innerSurface.style.transform = '';
    }

    const duration = displacementPx > 0 ? Math.max(150, Math.round(SLIDE_MS * (1 - progress))) : SLIDE_MS;
    const fromTransform = displacementPx > 0 ? `translate3d(${displacementPx}px, 0, 0)` : 'translate3d(0, 0, 0)';
    detailEl.style.transform = 'translate3d(100%, 0, 0)';
    const detailAnim = detailEl.animate(
      [{ transform: fromTransform }, { transform: 'translate3d(100%, 0, 0)' }],
      { duration, easing: SLIDE_EASE },
    );
    const anims: Animation[] = [detailAnim];

    if (scrimEl && typeof scrimEl.animate === 'function') {
      const fromOpacity = Math.max(0, 1 - progress);
      scrimEl.style.opacity = '0';
      anims.push(scrimEl.animate([{ opacity: fromOpacity }, { opacity: 0 }], { duration, easing: SLIDE_EASE }));
    }
    activeAnimsRef.current = anims;

    const finish = () => {
      closingRef.current = false;
      onDismissRef.current();
    };
    void detailAnim.finished.then(finish, finish);
  }, [cancelActiveAnims]);

  const hasDetail = detailKey !== null;
  const swipeHandlers = useSwipeBack({
    onBack: requestClose,
    enabled: hasDetail && swipeEnabled,
    onSwipeProgress: handleSwipeProgress,
    onSwipeEnd: handleSwipeEnd,
  });

  return (
    <div className={`relative flex h-full min-h-0 w-full flex-col overflow-hidden ${className}`}>
      <div
        style={{ backfaceVisibility: 'hidden' }}
        className="absolute inset-0 z-10 flex min-h-0 flex-col overflow-hidden transform-gpu"
        inert={hasDetail || baseInert}
        aria-hidden={hasDetail}
      >
        {base}
        {hasDetail && (
          <div
            ref={scrimRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 bg-black/35 will-change-[opacity]"
          />
        )}
      </div>

      {hasDetail && (
        <div
          ref={detailLayerRef}
          key={detailKey}
          style={{ backfaceVisibility: 'hidden' }}
          className="absolute inset-0 z-20 will-change-transform"
        >
          <div
            {...swipeHandlers}
            data-detail-layer
            style={{ touchAction: 'pan-y', backfaceVisibility: 'hidden' }}
            className="flex h-full min-h-0 w-full flex-col overflow-hidden shadow-2xl transform-gpu will-change-transform"
          >
            {renderDetail(requestClose)}
          </div>
        </div>
      )}
    </div>
  );
};

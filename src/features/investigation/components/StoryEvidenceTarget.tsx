import React, { useEffect, useRef, useState } from 'react';
import type { UniversalEvidenceItem } from '../../../shared/contracts/evidence';

interface StoryEvidenceTargetProps {
  item: UniversalEvidenceItem;
  onTriggerEvidence: (item: UniversalEvidenceItem) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function isEvidenceTriggerKey(key: string): boolean {
  return key === 'Enter' || key === ' ';
}

/**
 * Universal Story Evidence Target.
 * Implements resilient pointer/touch long-press (380ms), desktop right-click,
 * and accessible keyboard triggers (Enter / Space) to open the Universal Evidence Pin Modal.
 *
 * Invariants:
 * - Normal click/tap NEVER triggers evidence pinning.
 * - Long-press (>= 380ms) triggers evidence modal with haptic feedback.
 * - Suppresses browser contextmenu and native text-drag.
 * - Keyboard Enter / Space triggers evidence modal.
 * - Provides active tactile feedback (scale-98 & cursor-pointer) while holding.
 */
export const StoryEvidenceTarget: React.FC<StoryEvidenceTargetProps> = ({
  item,
  onTriggerEvidence,
  children,
  className = '',
  disabled = false,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startCoordsRef = useRef<{ x: number; y: number } | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef(false);
  const windowCleanupRef = useRef<(() => void) | null>(null);
  const [isPressing, setIsPressing] = useState(false);

  const detachWindowListeners = () => {
    if (windowCleanupRef.current) {
      windowCleanupRef.current();
      windowCleanupRef.current = null;
    }
  };

  useEffect(() => {
    if (disabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      detachWindowListeners();
      activePointerIdRef.current = null;
      startCoordsRef.current = null;
      setIsPressing(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      detachWindowListeners();
    };
  }, [disabled]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    detachWindowListeners();
    setIsPressing(false);
    activePointerIdRef.current = null;
    startCoordsRef.current = null;
  };

  const triggerEvidence = () => {
    detachWindowListeners();
    isLongPressTriggeredRef.current = true;
    setIsPressing(false);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(50);
      } catch {
        // Ignore vibration errors on unsupported platforms
      }
    }
    onTriggerEvidence(item);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    // Only primary button: left click (button === 0) or touch/pen
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    clearTimer();
    isLongPressTriggeredRef.current = false;
    activePointerIdRef.current = e.pointerId;
    startCoordsRef.current = { x: e.clientX, y: e.clientY };
    setIsPressing(true);

    // Track pointerup/cancel/move on window while pressing so an ancestor calling
    // setPointerCapture() (e.g., lightbox stage) cannot swallow release and trigger a tap.
    if (typeof window !== 'undefined') {
      const pointerId = e.pointerId;
      const onWinMove = (ev: PointerEvent) => {
        if (!startCoordsRef.current || ev.pointerId !== pointerId) return;
        const dx = Math.abs(ev.clientX - startCoordsRef.current.x);
        const dy = Math.abs(ev.clientY - startCoordsRef.current.y);
        if (dx > 18 || dy > 18) clearTimer();
      };
      const onWinEnd = (ev: PointerEvent) => {
        if (ev.pointerId === pointerId) clearTimer();
      };
      window.addEventListener('pointermove', onWinMove, { passive: true });
      window.addEventListener('pointerup', onWinEnd, { passive: true });
      window.addEventListener('pointercancel', onWinEnd, { passive: true });
      windowCleanupRef.current = () => {
        window.removeEventListener('pointermove', onWinMove);
        window.removeEventListener('pointerup', onWinEnd);
        window.removeEventListener('pointercancel', onWinEnd);
      };
    }

    timerRef.current = setTimeout(() => {
      triggerEvidence();
    }, 380);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startCoordsRef.current || e.pointerId !== activePointerIdRef.current) return;
    const dx = Math.abs(e.clientX - startCoordsRef.current.x);
    const dy = Math.abs(e.clientY - startCoordsRef.current.y);
    // Allow up to 18px movement tolerance for finger jitter or slight mouse tremor
    if (dx > 18 || dy > 18) {
      clearTimer();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerId === activePointerIdRef.current) {
      clearTimer();
    }
  };

  const handlePointerCancel = () => {
    clearTimer();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // The modal opens under the finger, so the browser's follow-up tap would land on its
    // backdrop and close it. Cancelling the touchend stops that synthesized click.
    if (isLongPressTriggeredRef.current && e.cancelable) {
      e.preventDefault();
      isLongPressTriggeredRef.current = false;
    }
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    // If long press was triggered, suppress the subsequent click event
    if (isLongPressTriggeredRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isLongPressTriggeredRef.current = false;
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    // Prevent browser context menu and allow desktop right-click to trigger evidence modal
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLongPressTriggeredRef.current) {
      clearTimer();
      triggerEvidence();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (isEvidenceTriggerKey(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      clearTimer();
      triggerEvidence();
    }
  };

  return (
    <div
      role="button"
      data-evidence-target="true"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled ? 'true' : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onTouchEnd={handleTouchEnd}
      onClickCapture={handleClickCapture}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      onDragStart={(e) => e.preventDefault()}
      className={`select-none cursor-pointer transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-2 ${
        isPressing ? 'scale-[0.98] opacity-95' : ''
      } ${className}`}
      style={{
        WebkitTouchCallout: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {children}
    </div>
  );
};

export default StoryEvidenceTarget;

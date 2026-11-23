import React from 'react';
import { useSwipeBack, UseSwipeBackOptions } from '../gestures/useSwipeBack';

export interface SwipeBackContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<UseSwipeBackOptions, 'onBack'> {
  onBack: () => void;
  children: React.ReactNode;
}

/**
 * Declarative container that triggers onBack when swiped right.
 */
export const SwipeBackContainer: React.FC<SwipeBackContainerProps> = ({
  onBack,
  enabled = true,
  threshold = 45,
  maxRatio = 0.8,
  maxDuration = 1500,
  maxStartDistance,
  onSwipeProgress,
  onSwipeEnd,
  children,
  className = '',
  ...props
}) => {
  const swipeHandlers = useSwipeBack({
    onBack,
    enabled,
    threshold,
    maxRatio,
    maxDuration,
    maxStartDistance,
    onSwipeProgress,
    onSwipeEnd,
  });

  return (
    <div {...swipeHandlers} className={className} style={{ touchAction: 'pan-y', ...props.style }} {...props}>
      {children}
    </div>
  );
};

export default SwipeBackContainer;


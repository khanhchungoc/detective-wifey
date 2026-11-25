import React, { memo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export const LAMP_IGNITION_TRANSITION = {
  duration: 0.85,
  times: [0, 0.18, 0.34, 0.55, 0.72, 1],
  ease: 'linear' as const,
};

export function getLampAmbientTransition(repeatDelay: number) {
  return {
    duration: 0.42,
    times: [0, 0.22, 0.48, 0.72, 1],
    ease: 'linear' as const,
    repeat: Infinity,
    repeatDelay,
  };
}

const LIGHT_IGNITION_OPACITY = [0.12, 0.95, 0.22, 1, 0.55, 1];
const LIGHT_AMBIENT_OPACITY = [1, 0.45, 0.94, 0.62, 1];
const DIMMER_IGNITION_OPACITY = [0.65, 0.04, 0.58, 0, 0.34, 0];
const DIMMER_AMBIENT_OPACITY = [0, 0.42, 0.05, 0.28, 0];

const DEFAULT_ROOM_DIMMER = (
  <div className="h-full w-full bg-[radial-gradient(ellipse_105%_85%_at_50%_0%,rgba(4,7,12,0.72)_0%,rgba(4,7,12,0.88)_55%,rgba(3,5,9,0.96)_100%)]" />
);

export interface OverheadLampHighlightProps {
  wash: React.ReactNode;
  dimmer?: React.ReactNode;
  source?: React.ReactNode;
  repeatDelay?: number;
  washClassName?: string;
  dimmerClassName?: string;
  sourceClassName?: string;
  staticWashOpacity?: number;
  staticSourceOpacity?: number;
}

/**
 * Shared darkroom overhead lamp lighting: ignition stutter followed by periodic rhythmic dips.
 * Animates exclusively `opacity` (`will-change-[opacity]`) and honors `prefers-reduced-motion`.
 */
export const OverheadLampHighlight: React.FC<OverheadLampHighlightProps> = memo(function OverheadLampHighlight({
  wash,
  dimmer = DEFAULT_ROOM_DIMMER,
  source,
  repeatDelay = 8.5,
  washClassName = 'inset-0 z-0',
  dimmerClassName = 'inset-0 z-[25]',
  sourceClassName = 'inset-x-0 top-0 z-10 flex flex-col items-center',
  staticWashOpacity = 1,
  staticSourceOpacity = 1,
}) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [phase, setPhase] = useState<'ignition' | 'ambient'>('ignition');

  if (prefersReducedMotion) {
    return (
      <>
        <div
          aria-hidden="true"
          data-lamp-layer="wash"
          className={`pointer-events-none absolute ${washClassName}`}
          style={staticWashOpacity === 1 ? undefined : { opacity: staticWashOpacity }}
        >
          {wash}
        </div>
        {source && (
          <div
            aria-hidden="true"
            data-lamp-layer="source"
            className={`pointer-events-none absolute ${sourceClassName}`}
            style={staticSourceOpacity === 1 ? undefined : { opacity: staticSourceOpacity }}
          >
            {source}
          </div>
        )}
      </>
    );
  }

  const sharedTransition =
    phase === 'ignition'
      ? LAMP_IGNITION_TRANSITION
      : getLampAmbientTransition(repeatDelay);

  const lightAnimate =
    phase === 'ignition'
      ? { opacity: LIGHT_IGNITION_OPACITY }
      : { opacity: LIGHT_AMBIENT_OPACITY };

  const dimmerAnimate =
    phase === 'ignition'
      ? { opacity: DIMMER_IGNITION_OPACITY }
      : { opacity: DIMMER_AMBIENT_OPACITY };

  return (
    <>
      <motion.div
        aria-hidden="true"
        data-lamp-layer="wash"
        className={`pointer-events-none absolute ${washClassName} will-change-[opacity]`}
        initial={phase === 'ignition' ? { opacity: 0.12 } : false}
        animate={lightAnimate}
        transition={sharedTransition}
        onAnimationComplete={() => {
          if (phase === 'ignition') {
            setPhase('ambient');
          }
        }}
      >
        {wash}
      </motion.div>

      <motion.div
        aria-hidden="true"
        data-lamp-layer="dimmer"
        className={`pointer-events-none absolute ${dimmerClassName} will-change-[opacity]`}
        initial={phase === 'ignition' ? { opacity: 0.65 } : false}
        animate={dimmerAnimate}
        transition={sharedTransition}
      >
        {dimmer}
      </motion.div>

      {source && (
        <motion.div
          aria-hidden="true"
          data-lamp-layer="source"
          className={`pointer-events-none absolute ${sourceClassName} will-change-[opacity]`}
          initial={phase === 'ignition' ? { opacity: 0.12 } : false}
          animate={lightAnimate}
          transition={sharedTransition}
        >
          {source}
        </motion.div>
      )}
    </>
  );
});

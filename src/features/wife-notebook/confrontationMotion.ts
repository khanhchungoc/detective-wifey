/**
 * Shared Confrontation Motion Vocabulary
 * Separates Narrative (time-driven ease-out, 150-350ms) from Responsive/Physics springs:
 * - SNAP: critically damped (zeta = 1.0, 0% overshoot) for D-pad choice transitions.
 * - POP: restrained bounce (zeta = 0.65, ~6.8% overshoot <= 8%) strictly for critical evidence hits and End verdict stamp.
 */

export const SNAP = {
  type: 'spring',
  stiffness: 400,
  damping: 40,
  mass: 1,
} as const;

export const POP = {
  type: 'spring',
  stiffness: 400,
  damping: 26,
  mass: 1,
} as const;

export const NARRATIVE_IN = {
  duration: 0.24,
  ease: [0.16, 1, 0.3, 1],
} as const;

/** Exit is ~0.7x entrance duration for crisp responsiveness. */
export const NARRATIVE_OUT = {
  duration: 0.16,
  ease: [0.4, 0, 1, 1],
} as const;

export const REDUCED_FADE = {
  duration: 0.15,
  ease: 'linear',
} as const;

/** Max 4 choice buttons staggered by 40ms each. */
export const CHOICE_STAGGER_S = 0.04;

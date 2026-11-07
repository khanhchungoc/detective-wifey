export interface OverlayRect { left: number; top: number; width: number; height: number }

export const NOTEBOOK_CLOSED_TRANSFORM = 'translate3d(100%, 0, 0)';
export const NOTEBOOK_OPEN_TRANSFORM = 'translate3d(0px, 0px, 0px)';
export const NOTEBOOK_SLIDE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const NOTEBOOK_OPEN_DURATION_MS = 380;
export const NOTEBOOK_CLOSE_DURATION_MS = 320;

/** Off-screen right drawer transform so the notebook slides cleanly with zero scale/radius mask thrash. */
export function anchoredTransform(_surface?: OverlayRect, _anchor?: OverlayRect): string {
  return NOTEBOOK_CLOSED_TRANSFORM;
}

/** Retarget from the rendered frame before cancelling, so a reversal or pull release never jumps. */
export function animateOverlay(element: HTMLElement, open: boolean, closedTransform = NOTEBOOK_CLOSED_TRANSFORM,
  complete: () => void, previous?: Pick<Animation, 'cancel'>, reducedMotion = false): Animation | undefined {
  const current = getComputedStyle(element);
  const hasCurrentTransform = Boolean(current.transform && current.transform !== 'none');
  const fromTransform = hasCurrentTransform
    ? current.transform
    : (open ? closedTransform : NOTEBOOK_OPEN_TRANSFORM);
  const closedTarget = !open && closedTransform === NOTEBOOK_CLOSED_TRANSFORM && element.offsetWidth > 0
    ? `translate3d(${element.offsetWidth}px, 0px, 0px)`
    : closedTransform;
  const toTransform = open ? NOTEBOOK_OPEN_TRANSFORM : closedTarget;
  const restTransform = open ? 'none' : closedTransform;

  previous?.cancel();
  element.getAnimations?.().forEach(anim => anim.cancel());
  element.style.opacity = '1';

  if (reducedMotion || !element.animate || closedTransform === 'none') {
    element.style.transform = restTransform;
    complete();
    return;
  }

  element.style.transform = toTransform;

  const keyframes: Keyframe[] = [
    { transform: fromTransform, offset: 0 },
    { transform: toTransform, offset: 1 },
  ];
  const animation = element.animate(keyframes, {
    duration: open ? NOTEBOOK_OPEN_DURATION_MS : NOTEBOOK_CLOSE_DURATION_MS,
    easing: NOTEBOOK_SLIDE_EASING,
    fill: 'both',
  });
  animation.onfinish = () => {
    element.style.transform = restTransform;
    animation.cancel?.();
    complete();
  };
  return animation;
}

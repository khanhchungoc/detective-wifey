import { describe, expect, it, vi } from 'vitest';
import { NOTEBOOK_CLOSED_TRANSFORM, NOTEBOOK_OPEN_TRANSFORM, anchoredTransform, animateOverlay } from './anchoredOverlay';

describe('notebook slide overlay motion', () => {
  it('uses an off-screen right hardware-accelerated slide transform when closed', () => {
    expect(anchoredTransform({ left: 100, top: 20, width: 400, height: 800 },
      { left: 456, top: 540, width: 44, height: 76 }))
      .toBe(NOTEBOOK_CLOSED_TRANSFORM);
    expect(anchoredTransform()).toBe(NOTEBOOK_CLOSED_TRANSFORM);
  });

  it('samples the visible frame before cancelling a reversed transition and retains exit until completion', () => {
    const sequence: string[] = [];
    vi.stubGlobal('getComputedStyle', () => {
      sequence.push('read'); return { transform: 'translate3d(140px, 0px, 0px)', opacity: '1' };
    });
    const animationCancel = vi.fn();
    const animation = { onfinish: null, cancel: animationCancel } as unknown as Animation;
    const animate = vi.fn((_frames: Keyframe[], _options?: KeyframeAnimationOptions) => animation);
    const element = { style: {}, animate } as unknown as HTMLElement;
    const complete = vi.fn();
    const cancel = vi.fn(() => sequence.push('cancel'));
    animateOverlay(element, false, NOTEBOOK_CLOSED_TRANSFORM, complete, { cancel });
    expect(sequence).toEqual(['read', 'cancel']);
    expect(animate.mock.calls[0][0]).toEqual([
      { transform: 'translate3d(140px, 0px, 0px)', offset: 0 },
      { transform: NOTEBOOK_CLOSED_TRANSFORM, offset: 1 },
    ]);
    expect(animate.mock.calls[0][1]).toMatchObject({ duration: 240, fill: 'both' });
    expect(complete).not.toHaveBeenCalled();
    animation.onfinish?.call(animation, {} as AnimationPlaybackEvent);
    expect(element.style.transform).toBe(NOTEBOOK_CLOSED_TRANSFORM);
    expect(animationCancel).toHaveBeenCalledOnce();
    expect(complete).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });

  it('clears transform to none when open finishes so zoomed corkboard text stays sharp', () => {
    vi.stubGlobal('getComputedStyle', () => ({ transform: 'translate3d(180px, 0px, 0px)', opacity: '1' }));
    const animationCancel = vi.fn();
    const animation = { onfinish: null, cancel: animationCancel } as unknown as Animation;
    const animate = vi.fn((_frames: Keyframe[], _options?: KeyframeAnimationOptions) => animation);
    const element = { style: {}, animate } as unknown as HTMLElement;
    const complete = vi.fn();
    animateOverlay(element, true, NOTEBOOK_CLOSED_TRANSFORM, complete);
    expect(animate.mock.calls[0][0]).toEqual([
      { transform: 'translate3d(180px, 0px, 0px)', offset: 0 },
      { transform: NOTEBOOK_OPEN_TRANSFORM, offset: 1 },
    ]);
    animation.onfinish?.call(animation, {} as AnimationPlaybackEvent);
    expect(element.style.transform).toBe('none');
    expect(animationCancel).toHaveBeenCalledOnce();
    expect(complete).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });

  it('animates from 0px to 100% when closing from the resting open state (transform: none)', () => {
    vi.stubGlobal('getComputedStyle', () => ({ transform: 'none', opacity: '1' }));
    const animationCancel = vi.fn();
    const animation = { onfinish: null, cancel: animationCancel } as unknown as Animation;
    const animate = vi.fn((_frames: Keyframe[], _options?: KeyframeAnimationOptions) => animation);
    const element = { style: {}, animate } as unknown as HTMLElement;
    const complete = vi.fn();
    animateOverlay(element, false, NOTEBOOK_CLOSED_TRANSFORM, complete);
    expect(animate.mock.calls[0][0]).toEqual([
      { transform: NOTEBOOK_OPEN_TRANSFORM, offset: 0 },
      { transform: NOTEBOOK_CLOSED_TRANSFORM, offset: 1 },
    ]);
    expect(animate.mock.calls[0][1]).toMatchObject({ duration: 240, fill: 'both' });
    animation.onfinish?.call(animation, {} as AnimationPlaybackEvent);
    expect(element.style.transform).toBe(NOTEBOOK_CLOSED_TRANSFORM);
    expect(complete).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });

  it('commits immediately without travel when reduced motion is enabled', () => {
    vi.stubGlobal('getComputedStyle', () => ({ transform: 'none', opacity: '0' }));
    const animate = vi.fn();
    const element = { style: {}, animate } as unknown as HTMLElement;
    const complete = vi.fn();
    animateOverlay(element, true, NOTEBOOK_CLOSED_TRANSFORM, complete, undefined, true);
    expect(animate).not.toHaveBeenCalled();
    expect(element.style).toMatchObject({ transform: 'none', opacity: '1' });
    expect(complete).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });
});

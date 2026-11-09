import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createSwipeBackEngine } from './useSwipeBack';
import { transition } from '../motion/transition';

let frames: (() => void)[];
const paint = () => { const callbacks = frames; frames = []; callbacks.forEach(callback => callback()); };

class Surface {
  style = { transform: '' };
  dataset = {};
  get clientWidth() { return 390; }
  getBoundingClientRect() { return { left: 0, top: 0, right: 390, bottom: 844, width: 390, height: 844 }; }
  animate = vi.fn(() => ({ cancel: vi.fn() }));
  closest(selector: string) { return selector === '[data-swipe-surface]' ? this : null; }
}
beforeEach(() => {
  frames = [];
  vi.stubGlobal('requestAnimationFrame', (callback: () => void) => { frames.push(callback); return frames.length; });
  vi.stubGlobal('cancelAnimationFrame', () => { frames = []; });
  vi.stubGlobal('HTMLElement', Surface);
  vi.stubGlobal('Element', Surface);
  vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
});
afterEach(() => vi.unstubAllGlobals());

it('tracks the finger and snaps back on cancellation without navigating', () => {
  const onBack = vi.fn();
  const engine = createSwipeBackEngine({ onBack });
  const surface = new Surface();
  engine.onTouchStart({ currentTarget: surface as unknown as HTMLElement, target: surface as unknown as HTMLElement,
    touches: [{ clientX: 10, clientY: 100 }] });
  engine.onTouchMove({ touches: [{ clientX: 40, clientY: 101 }] });
  paint();
  expect(surface.style.transform).toBe('translate3d(30px, 0, 0)');
  engine.onTouchCancel();
  engine.onTouchEnd({ changedTouches: [{ clientX: 120, clientY: 100 }] });
  expect(surface.style.transform).toBe('');
  expect(surface.animate).toHaveBeenCalledOnce();
  expect(onBack).not.toHaveBeenCalled();
});

it('coalesces movement into one frame and measures width only at gesture start', () => {
  const engine = createSwipeBackEngine({ onBack: vi.fn() });
  const surface = new Surface();
  const width = vi.spyOn(surface, 'clientWidth', 'get');
  engine.onTouchStart({ currentTarget: surface as unknown as HTMLElement, target: surface as unknown as HTMLElement,
    touches: [{ clientX: 10, clientY: 100 }] });
  engine.onTouchMove({ touches: [{ clientX: 40, clientY: 101 }] });
  engine.onTouchMove({ touches: [{ clientX: 80, clientY: 101 }] });
  expect(frames).toHaveLength(1);
  paint();
  expect(surface.style.transform).toBe('translate3d(70px, 0, 0)');
  expect(width).toHaveBeenCalledOnce();
  engine.dispose();
});

it('hands the visible dragged position to navigation until the old snapshot is taken', async () => {
  let commit = () => {};
  let finish = () => {};
  vi.stubGlobal('document', { documentElement: { dataset: {} }, startViewTransition: (callback: () => void) => {
    commit = callback;
    return { skipTransition: vi.fn(), ready: Promise.resolve(), finished: new Promise<void>(resolve => { finish = resolve; }) };
  } });
  const surface = new Surface();
  const onBack = vi.fn(() => transition('pop', () => {}));
  const engine = createSwipeBackEngine({ onBack });
  engine.onTouchStart({ currentTarget: surface as unknown as HTMLElement, target: surface as unknown as HTMLElement,
    touches: [{ clientX: 10, clientY: 100 }] });
  engine.onTouchMove({ touches: [{ clientX: 110, clientY: 100 }] });
  engine.onTouchEnd({ changedTouches: [{ clientX: 110, clientY: 100 }] });
  expect(surface.style.transform).toBe('translate3d(100px, 0, 0)');
  await Promise.resolve();
  expect(surface.style.transform).toBe('translate3d(100px, 0, 0)');
  commit();
  expect(surface.style.transform).toBe('');
  expect(onBack).toHaveBeenCalledOnce();
  finish();
  await Promise.resolve();
  engine.dispose();
});

it('gives nested views ownership and leaves the parent stationary', () => {
  const onBack = vi.fn();
  const parent = new Surface();
  const child = new Surface();
  const engine = createSwipeBackEngine({ onBack });
  engine.onPointerDown({ currentTarget: parent as unknown as HTMLElement, target: child as unknown as HTMLElement,
    pointerType: 'mouse', button: 0, clientX: 10, clientY: 100 });
  engine.onPointerMove({ pointerType: 'mouse', clientX: 110, clientY: 100 });
  engine.onPointerUp({ pointerType: 'mouse', button: 0, clientX: 110, clientY: 100 });
  expect(parent.style.transform).toBe('');
  expect(onBack).not.toHaveBeenCalled();
});

it('abandons horizontal navigation when the gesture becomes a vertical scroll', () => {
  const onBack = vi.fn();
  const engine = createSwipeBackEngine({ onBack });
  const surface = new Surface();
  engine.onTouchStart({ currentTarget: surface as unknown as HTMLElement, target: surface as unknown as HTMLElement,
    touches: [{ clientX: 10, clientY: 100 }] });
  engine.onTouchMove({ touches: [{ clientX: 40, clientY: 180 }] });
  engine.onTouchEnd({ changedTouches: [{ clientX: 110, clientY: 100 }] });
  expect(surface.style.transform).toBe('');
  expect(onBack).not.toHaveBeenCalled();
});

it('honors changes to gesture eligibility while an overlay is open', () => {
  const options = { onBack: vi.fn(), enabled: true };
  const engine = createSwipeBackEngine(options);
  const surface = new Surface();
  engine.onTouchStart({ currentTarget: surface as unknown as HTMLElement, target: surface as unknown as HTMLElement,
    touches: [{ clientX: 10, clientY: 100 }] });
  options.enabled = false;
  engine.onTouchEnd({ changedTouches: [{ clientX: 110, clientY: 100 }] });
  expect(options.onBack).not.toHaveBeenCalled();
  engine.dispose();
});

it('resumes a cancelled swipe from its visible position when grabbed again', () => {
  const engine = createSwipeBackEngine({ onBack: vi.fn() });
  const surface = new Surface();
  const begin = () => engine.onTouchStart({ currentTarget: surface as unknown as HTMLElement, target: surface as unknown as HTMLElement,
    touches: [{ clientX: 10, clientY: 100 }] });
  begin();
  engine.onTouchMove({ touches: [{ clientX: 90, clientY: 100 }] });
  paint();
  engine.onTouchCancel();
  vi.stubGlobal('getComputedStyle', () => ({ transform: 'matrix(1, 0, 0, 1, 40, 0)' }));
  vi.stubGlobal('DOMMatrixReadOnly', class {
    m41: number;
    constructor(transform?: string) { this.m41 = transform ? 40 : 0; }
  });
  begin();
  expect(surface.style.transform).toBe('translate3d(40px, 0, 0)');
  engine.onTouchMove({ touches: [{ clientX: 30, clientY: 100 }] });
  paint();
  expect(surface.style.transform).toBe('translate3d(60px, 0, 0)');
  engine.dispose();
});

it('does not schedule gesture frames with reduced motion or after disposal', () => {
  vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) });
  const engine = createSwipeBackEngine({ onBack: vi.fn() });
  const surface = new Surface();
  engine.onTouchStart({ currentTarget: surface as unknown as HTMLElement, target: surface as unknown as HTMLElement,
    touches: [{ clientX: 10, clientY: 100 }] });
  engine.onTouchMove({ touches: [{ clientX: 110, clientY: 100 }] });
  expect(frames).toHaveLength(0);
  engine.dispose();
  engine.onTouchMove({ touches: [{ clientX: 180, clientY: 100 }] });
  expect(frames).toHaveLength(0);
  expect(surface.style.transform).toBe('');
});

it('ignores pointercancel and pointerleave for touch events so mobile swipes are not cancelled', () => {
  const onBack = vi.fn();
  const engine = createSwipeBackEngine({ onBack, threshold: 45 });
  const surface = new Surface();

  engine.onTouchStart({
    currentTarget: surface as unknown as HTMLElement,
    target: surface as unknown as HTMLElement,
    touches: [{ clientX: 20, clientY: 100 }],
  });

  // Mobile browser fires pointercancel/pointerleave for touch pointer
  engine.onPointerCancel({ pointerType: 'touch' });
  engine.onPointerLeave({ pointerType: 'touch' });

  engine.onTouchMove({ touches: [{ clientX: 90, clientY: 105 }] });
  engine.onTouchEnd({ changedTouches: [{ clientX: 90, clientY: 105 }] });

  expect(onBack).toHaveBeenCalledOnce();
  engine.dispose();
});

it('survives natural mobile thumb contact jitter without premature cancellation', () => {
  const onBack = vi.fn();
  const engine = createSwipeBackEngine({ onBack, threshold: 45 });
  const surface = new Surface();

  engine.onTouchStart({
    currentTarget: surface as unknown as HTMLElement,
    target: surface as unknown as HTMLElement,
    touches: [{ clientX: 20, clientY: 100 }],
  });

  // Initial thumb rocking jitter (14px vertical drift with only 8px horizontal move)
  engine.onTouchMove({ touches: [{ clientX: 28, clientY: 114 }] });

  // Main thumb swipe rightward (85px horizontal travel, 18px vertical)
  engine.onTouchMove({ touches: [{ clientX: 105, clientY: 118 }] });
  engine.onTouchEnd({ changedTouches: [{ clientX: 105, clientY: 118 }] });

  expect(onBack).toHaveBeenCalledOnce();
  engine.dispose();
});

it('cleans up data-swipe-surface attribute on gesture completion', () => {
  const onBack = vi.fn();
  const engine = createSwipeBackEngine({ onBack });
  const surface = new Surface();

  engine.onTouchStart({
    currentTarget: surface as unknown as HTMLElement,
    target: surface as unknown as HTMLElement,
    touches: [{ clientX: 20, clientY: 100 }],
  });
  expect('swipeSurface' in surface.dataset).toBe(true);

  engine.onTouchCancel();
  expect('swipeSurface' in surface.dataset).toBe(false);
  engine.dispose();
});

it('restricts gesture start to maxStartDistance when specified', () => {
  const onBack = vi.fn();
  const onSwipeProgress = vi.fn();
  const engine = createSwipeBackEngine({ onBack, maxStartDistance: 44, onSwipeProgress });
  const surface = new Surface();

  // Touch starting at x=100 (> 44) should be ignored
  engine.onTouchStart({
    currentTarget: surface as unknown as HTMLElement,
    target: surface as unknown as HTMLElement,
    touches: [{ clientX: 100, clientY: 100 }],
  });
  engine.onTouchMove({ touches: [{ clientX: 180, clientY: 100 }] });
  paint();
  expect(surface.style.transform).toBe('');
  expect(onSwipeProgress).not.toHaveBeenCalled();

  // Touch starting at x=20 (<= 44) should track
  engine.onTouchStart({
    currentTarget: surface as unknown as HTMLElement,
    target: surface as unknown as HTMLElement,
    touches: [{ clientX: 20, clientY: 100 }],
  });
  engine.onTouchMove({ touches: [{ clientX: 100, clientY: 100 }] });
  paint();
  expect(surface.style.transform).toBe('translate3d(80px, 0, 0)');
  expect(onSwipeProgress).toHaveBeenCalledWith(80 / 390, 80);

  engine.onTouchEnd({ changedTouches: [{ clientX: 100, clientY: 100 }] });
  expect(onBack).toHaveBeenCalledOnce();
  engine.dispose();
});

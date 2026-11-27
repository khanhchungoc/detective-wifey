import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react', () => ({
  useCallback: (callback: unknown) => callback,
  useEffect: (effect: () => (() => void) | undefined) => {
    const cleanup = effect();
    if (cleanup) cleanups.push(cleanup);
  },
  useRef: (current: unknown) => ({ current }),
  useState: (initial: unknown) => {
    let value = typeof initial === 'function' ? initial() : initial;
    const set = (next: unknown) => {
      value = typeof next === 'function' ? next(value) : next;
      updates.push(value);
    };
    return [value, set];
  },
}));
const updates: unknown[] = [];
const cleanups: (() => void)[] = [];
const frames = new Map<number, FrameRequestCallback>();
let nextFrameId = 0;
function flushFrame() {
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach(callback => callback(0));
}
beforeEach(() => {
  frames.clear();
  cleanups.length = 0;
  updates.length = 0;
  nextFrameId = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    const id = ++nextFrameId;
    frames.set(id, callback);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => frames.delete(id)));
});
import { useCorkboardGestures } from './useCorkboardGestures';

function pointer(pointerId: number, clientX: number, clientY: number) {
  return {
    pointerId, clientX, clientY, pointerType: 'touch', button: 0,
    stopPropagation: vi.fn(),
    target: { closest: () => null },
    currentTarget: {
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 600 }),
      setPointerCapture: vi.fn(), hasPointerCapture: () => true, releasePointerCapture: vi.fn(),
    },
  } as unknown as Parameters<ReturnType<typeof useCorkboardGestures>['containerProps']['onPointerDown']>[0];
}

describe('corkboard mobile gesture ownership', () => {
  it('can recenter and pan after Strict Mode cleans up a pending camera frame', () => {
    const { containerProps: handlers, setViewport, setCenter } = useCorkboardGestures();
    setViewport({ x: 800, y: 900, zoom: 2 });
    cleanups.forEach(cleanup => cleanup());
    expect(cancelAnimationFrame).toHaveBeenCalled();
    expect(frames.size).toBe(0);

    // Auto arrange recenters the camera before the next background drag.
    setCenter(900, 900);
    flushFrame();
    expect(updates).toEqual([{ x: 900, y: 900, zoom: 2 }]);
    handlers.onPointerDown(pointer(1, 200, 300));
    handlers.onPointerMove(pointer(1, 240, 320));
    flushFrame();
    expect(updates[updates.length - 1]).toEqual({ x: 880, y: 890, zoom: 2 });
  });

  it('starts a new gesture from the latest camera before React commits it', () => {
    updates.length = 0;
    const { containerProps: handlers, setViewport } = useCorkboardGestures();
    setViewport({ x: 800, y: 900, zoom: 2 });
    handlers.onPointerDown(pointer(1, 200, 300));
    handlers.onPointerMove(pointer(1, 240, 320));
    flushFrame();
    expect(updates).toEqual([{ x: 780, y: 890, zoom: 2 }]);
  });

  it('measures the pinch bounds once rather than reading layout on every move', () => {
    const { containerProps: handlers } = useCorkboardGestures();
    handlers.onPointerDownCapture(pointer(1, 100, 300));
    const second = pointer(2, 300, 300);
    const measure = vi.fn(second.currentTarget.getBoundingClientRect);
    second.currentTarget.getBoundingClientRect = measure;
    handlers.onPointerDownCapture(second);
    const move = pointer(2, 350, 300);
    move.currentTarget.getBoundingClientRect = measure;
    handlers.onPointerMoveCapture(move);
    handlers.onPointerMoveCapture(move);
    expect(measure).toHaveBeenCalledTimes(1);
  });

  it('coalesces pointer moves into the latest position each frame', () => {
    updates.length = 0;
    const { containerProps: handlers } = useCorkboardGestures({ initialViewport: { x: 1000, y: 1000, zoom: 1 } });
    handlers.onPointerDown(pointer(1, 200, 300));
    handlers.onPointerMove(pointer(1, 210, 310));
    handlers.onPointerMove(pointer(1, 240, 330));
    expect(updates).toHaveLength(0);
    expect(frames.size).toBe(1);
    flushFrame();
    expect(updates).toEqual([{ x: 960, y: 970, zoom: 1 }]);
  });

  it('pans from a string and suppresses selection after dragging', () => {
    updates.length = 0;
    const { containerProps: handlers } = useCorkboardGestures({ initialViewport: { x: 1000, y: 1000, zoom: 1 } });
    const start = pointer(1, 200, 300);
    start.target = { closest: (selector: string) => selector === '.corkboard-string' ? {} : null } as unknown as EventTarget;
    handlers.onPointerDownCapture(start);
    handlers.onPointerDown(start);
    expect(start.currentTarget.setPointerCapture).not.toHaveBeenCalled();
    handlers.onPointerMove(pointer(1, 250, 320));
    flushFrame();
    expect(updates[updates.length - 1]).toEqual({ x: 950, y: 980, zoom: 1 });
    handlers.onPointerUp(pointer(1, 250, 320));
    const click = { stopPropagation: vi.fn(), preventDefault: vi.fn() };
    handlers.onClickCapture(click as unknown as Parameters<typeof handlers.onClickCapture>[0]);
    expect(click.stopPropagation).toHaveBeenCalled();
  });

  it('anchors pinch at the finger midpoint and suppresses pan through the final finger lift', () => {
    updates.length = 0;
    const { containerProps: handlers } = useCorkboardGestures({ initialViewport: { x: 1000, y: 1000, zoom: 1 } });
    const first = pointer(1, 200, 300);
    handlers.onPointerDownCapture(first);
    handlers.onPointerDown(first);
    handlers.onPointerDownCapture(pointer(2, 300, 300));
    const move = pointer(2, 400, 300);
    handlers.onPointerMoveCapture(move);
    flushFrame();
    expect(updates[updates.length - 1]).toEqual({ x: 1000, y: 1000, zoom: 2 });
    const count = updates.length;
    handlers.onPointerMove(pointer(1, 150, 300));
    expect(updates).toHaveLength(count);
    handlers.onPointerUpCapture(pointer(2, 400, 300));
    handlers.onPointerMoveCapture(pointer(1, 100, 300));
    handlers.onPointerMove(pointer(1, 100, 300));
    expect(updates).toHaveLength(count);
    handlers.onPointerUpCapture(pointer(1, 100, 300));
    expect(updates[updates.length - 1]).toBe(false);
  });

  it('leaves cancel and other buttons out of canvas pointer capture', () => {
    updates.length = 0;
    const { containerProps: handlers } = useCorkboardGestures();
    const event = pointer(1, 200, 300);
    event.target = { closest: (selector: string) => selector.includes('button') ? {} : null } as unknown as EventTarget;
    handlers.onPointerDownCapture(event);
    handlers.onPointerDown(event);
    handlers.onPointerMove(pointer(1, 250, 300));
    expect(event.currentTarget.setPointerCapture).not.toHaveBeenCalled();
    expect(event.stopPropagation).not.toHaveBeenCalled();
    expect(updates).toHaveLength(0);
  });

  it('does not treat pointer cancellation as a double tap', () => {
    updates.length = 0;
    const { containerProps: handlers } = useCorkboardGestures();
    handlers.onPointerDown(pointer(1, 200, 300));
    handlers.onPointerCancel();
    handlers.onPointerDown(pointer(2, 200, 300));
    handlers.onPointerUp(pointer(2, 200, 300));
    expect(updates).toHaveLength(0);
  });

  it('drives pan directly on planeRef with zero React state commits until pointer up, and captures pointer only once', () => {
    updates.length = 0;
    const plane = { style: { transform: '', willChange: '' } } as unknown as HTMLDivElement;
    const planeRef = { current: plane };
    const { containerProps: handlers } = useCorkboardGestures({
      initialViewport: { x: 1000, y: 1000, zoom: 1 },
      planeRef,
    });
    const start = pointer(1, 200, 300);
    start.target = { closest: (selector: string) => selector === '.corkboard-string' ? {} : null } as unknown as EventTarget;
    handlers.onPointerDown(start);

    const move1 = pointer(1, 220, 310);
    const move2 = pointer(1, 250, 330);
    move2.currentTarget = move1.currentTarget;
    handlers.onPointerMove(move1);
    handlers.onPointerMove(move2);
    expect(move1.currentTarget.setPointerCapture).toHaveBeenCalledTimes(1);
    expect(plane.style.willChange).toBe('transform');

    flushFrame();
    expect(plane.style.transform).toBe('translate3d(-950px, -970px, 0) scale(1)');
    expect(updates).toHaveLength(0);

    handlers.onPointerUp(pointer(1, 250, 330));
    expect(plane.style.willChange).toBe('');
    expect(updates).toEqual([{ x: 950, y: 970, zoom: 1 }]);
  });

  it('mirrors every plane transform onto the board surface layer so the chalkboard pans and zooms with the cards', () => {
    updates.length = 0;
    const plane = { style: { transform: '', willChange: '' } } as unknown as HTMLDivElement;
    const surface = { style: { transform: '', willChange: '' } } as unknown as HTMLDivElement;
    const { containerProps: handlers } = useCorkboardGestures({
      initialViewport: { x: 1000, y: 1000, zoom: 1 },
      planeRef: { current: plane },
      surfaceRef: { current: surface },
    });
    const start = pointer(1, 200, 300);
    start.target = { closest: (selector: string) => selector === '.corkboard-string' ? {} : null } as unknown as EventTarget;
    handlers.onPointerDown(start);
    handlers.onPointerMove(pointer(1, 250, 330));
    expect(surface.style.willChange).toBe('transform');

    flushFrame();
    expect(surface.style.transform).toBe(plane.style.transform);
    expect(surface.style.transform).toBe('translate3d(-950px, -970px, 0) scale(1)');

    handlers.onPointerUp(pointer(1, 250, 330));
    expect(surface.style.willChange).toBe('');
    expect(surface.style.transform).toBe(plane.style.transform);
  });

  it('attaches a non-passive native wheel listener on boardRef so trackpad pinch zooms the board without zooming the page', () => {
    updates.length = 0;
    let wheelHandler: ((e: WheelEvent) => void) | undefined;
    const addEventListener = vi.fn((type: string, cb: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) => {
      if (type === 'wheel') {
        expect(opts).toEqual({ passive: false });
        wheelHandler = cb as (e: WheelEvent) => void;
      }
    });
    const removeEventListener = vi.fn();
    const board = {
      addEventListener,
      removeEventListener,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 600 }),
    } as unknown as HTMLDivElement;

    useCorkboardGestures({
      initialViewport: { x: 900, y: 900, zoom: 1 },
      boardRef: { current: board },
    });

    expect(addEventListener).toHaveBeenCalledWith('wheel', expect.any(Function), { passive: false });
    const preventDefault = vi.fn();
    wheelHandler?.({
      preventDefault,
      clientX: 200,
      clientY: 300,
      deltaX: 0,
      deltaY: -10,
      deltaMode: 0,
      ctrlKey: true,
      metaKey: false,
    } as unknown as WheelEvent);
    expect(preventDefault).toHaveBeenCalledTimes(1);
    flushFrame();
    const zoomed = updates[0] as { zoom: number };
    expect(zoomed.zoom).toBeGreaterThan(1);

    // Two-finger trackpad scroll (no ctrlKey) pans in 2D
    updates.length = 0;
    wheelHandler?.({
      preventDefault,
      clientX: 200,
      clientY: 300,
      deltaX: 40,
      deltaY: -20,
      deltaMode: 0,
      ctrlKey: false,
      metaKey: false,
    } as unknown as WheelEvent);
    flushFrame();
    const panned = updates[0] as { x: number; y: number; zoom: number };
    expect(panned.zoom).toBe(zoomed.zoom);
    expect(panned.x).toBeGreaterThan(900);
    expect(panned.y).toBeLessThan(900);
  });
});


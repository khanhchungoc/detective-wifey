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
function flushFrame(time = 0) {
  const pending = [...frames.values()];
  frames.clear();
  pending.forEach(callback => callback(time));
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

    flushFrame();
    expect(plane.style.transform).toBe('translate3d(-950px, -970px, 0) scale(1)');
    expect(updates).toHaveLength(0);

    handlers.onPointerUp(pointer(1, 250, 330));
    expect(updates).toEqual([{ x: 950, y: 970, zoom: 1 }]);
  });

  it('drives the board surface with absolute GPU scale so the chalkboard pans and zooms without CSS zoom re-raster', () => {
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

    flushFrame();
    expect(plane.style.transform).toBe('translate3d(-950px, -970px, 0) scale(1)');
    expect(surface.style.transform).toBe('translate3d(-950px, -970px, 0) scale(1)');

    handlers.onPointerUp(pointer(1, 250, 330));
    expect(plane.style.transform).toBe('translate3d(-950px, -970px, 0)');
    expect(surface.style.transform).toBe('translate3d(-950px, -970px, 0) scale(1)');
  });

  it('reports single background taps in board coordinates so the notebook can tell board from wall', () => {
    const taps: { x: number; y: number }[] = [];
    const { containerProps: handlers } = useCorkboardGestures({
      initialViewport: { x: 900, y: 900, zoom: 2 },
      onTapBackground: point => taps.push(point),
    });
    handlers.onPointerDown(pointer(1, 300, 400));
    handlers.onPointerUp(pointer(1, 300, 400));
    // Screen center is (200, 300); 100px right and 100px down at zoom 2 = +50 board units.
    expect(taps).toEqual([{ x: 950, y: 950 }]);
  });

  it('double tap zooms to 2x around the tapped spot, and a second double tap zooms back to 1x', () => {
    const { containerProps: handlers, viewportRef } = useCorkboardGestures({
      initialViewport: { x: 900, y: 900, zoom: 1 },
      reducedMotion: true,
    });
    const tap = () => {
      handlers.onPointerDown(pointer(1, 300, 400));
      handlers.onPointerUp(pointer(1, 300, 400));
    };
    tap();
    tap();
    flushFrame();
    // Tapped board point (1000, 1000) stays under the finger at 2x.
    expect(updates).toEqual([{ x: 950, y: 950, zoom: 2 }]);
    expect(viewportRef.current).toEqual({ x: 950, y: 950, zoom: 2 });

    tap();
    tap();
    flushFrame();
    expect(updates[updates.length - 1]).toEqual({ x: 900, y: 900, zoom: 1 });
  });

  it('invokes onDoubleTapBackground when provided instead of toggling 2x zoom', () => {
    const doubleTaps: { x: number; y: number }[] = [];
    const { containerProps: handlers } = useCorkboardGestures({
      initialViewport: { x: 900, y: 600, zoom: 1 },
      onDoubleTapBackground: point => doubleTaps.push(point),
    });
    const tap = () => {
      handlers.onPointerDown(pointer(1, 300, 400));
      handlers.onPointerUp(pointer(1, 300, 400));
    };
    tap();
    tap();
    expect(doubleTaps).toEqual([{ x: 1000, y: 700 }]);
    expect(updates).toHaveLength(0);
  });

  it('triggers onPinchOutAtMinZoom only when a new pinch-in gesture starts already at MIN_ZOOM', () => {
    const onPinchOutAtMinZoom = vi.fn();
    const { containerProps: handlers } = useCorkboardGestures({
      initialViewport: { x: 900, y: 600, zoom: 1 },
      onPinchOutAtMinZoom,
    });
    // First pinch from 1.0 down to min zoom clamps cleanly without closing the board.
    handlers.onPointerDownCapture(pointer(1, 100, 300));
    handlers.onPointerDownCapture(pointer(2, 300, 300));
    handlers.onPointerMoveCapture(pointer(2, 140, 300));
    flushFrame();
    handlers.onPointerUpCapture(pointer(2, 140, 300));
    handlers.onPointerUpCapture(pointer(1, 100, 300));
    expect(onPinchOutAtMinZoom).not.toHaveBeenCalled();

    // Second pinch starting already at MIN_ZOOM and pinching inward triggers close to wall view.
    handlers.onPointerDownCapture(pointer(3, 100, 300));
    handlers.onPointerDownCapture(pointer(4, 300, 300));
    handlers.onPointerMoveCapture(pointer(4, 240, 300));
    expect(onPinchOutAtMinZoom).toHaveBeenCalledTimes(1);
    handlers.onPointerUpCapture(pointer(4, 240, 300));
    handlers.onPointerUpCapture(pointer(3, 100, 300));

    // After lifting fingers, pan and pinch remain unlocked (no stuck multiTouch state).
    updates.length = 0;
    handlers.onPointerDown(pointer(5, 200, 300));
    handlers.onPointerMove(pointer(5, 240, 320));
    flushFrame();
    expect(updates).toHaveLength(1);
    handlers.onPointerUp(pointer(5, 240, 320));
  });

  it('supports 1-gesture pinch-to-zoom directly from locked wall view', () => {
    const onPinchInFromLocked = vi.fn();
    const { containerProps: handlers, viewportRef } = useCorkboardGestures({
      initialViewport: { x: 900, y: 600, zoom: 0.2 },
      locked: true,
      onPinchInFromLocked,
    });
    handlers.onPointerDownCapture(pointer(1, 150, 300));
    handlers.onPointerDownCapture(pointer(2, 250, 300));
    // Spreading fingers apart (>8%) unlocks into focus view and zooms live in the same gesture.
    handlers.onPointerMoveCapture(pointer(2, 450, 300));
    flushFrame();
    expect(onPinchInFromLocked).toHaveBeenCalledTimes(1);
    expect(viewportRef.current.zoom).toBeCloseTo(0.6, 2);
    handlers.onPointerUpCapture(pointer(2, 450, 300));
    handlers.onPointerUpCapture(pointer(1, 150, 300));
  });

  it('ignores pan, pinch and wheel input while locked (wall view)', () => {
    const plane = { style: { transform: '', willChange: '' } } as unknown as HTMLDivElement;
    const { containerProps: handlers } = useCorkboardGestures({
      initialViewport: { x: 900, y: 900, zoom: 0.2 },
      planeRef: { current: plane },
      locked: true,
    });
    handlers.onPointerDownCapture(pointer(1, 100, 100));
    handlers.onPointerDownCapture(pointer(2, 200, 200));
    handlers.onPointerDown(pointer(1, 100, 100));
    handlers.onPointerMove(pointer(1, 200, 250));
    handlers.onPointerUp(pointer(1, 200, 250));
    flushFrame();
    expect(plane.style.transform).toBe('');
    expect(updates).toHaveLength(0);
  });

  it('flies the camera on the GPU plane, scales surface absolutely, and keeps plane relative scale until React commits the new zoom', () => {
    vi.spyOn(performance, 'now').mockReturnValue(0);
    const plane = { style: { transform: '', willChange: '' } } as unknown as HTMLDivElement;
    const surface = { style: { transform: '', willChange: '' } } as unknown as HTMLDivElement;
    const { animateTo, containerProps: handlers } = useCorkboardGestures({
      initialViewport: { x: 900, y: 900, zoom: 0.2 },
      planeRef: { current: plane },
      surfaceRef: { current: surface },
    });
    animateTo({ x: 400, y: 500, zoom: 1 }, 400);
    flushFrame(200);
    expect(plane.style.transform).toContain('scale(');
    expect(surface.style.transform).toContain('scale(');
    expect(surface.style.transform).not.toBe(plane.style.transform);
    expect(updates).toHaveLength(0);

    // Input is ignored mid-flight so a stray drag cannot fight the animation.
    handlers.onPointerDown(pointer(1, 100, 100));
    handlers.onPointerMove(pointer(1, 200, 200));

    flushFrame(400);
    expect(updates).toEqual([{ x: 400, y: 500, zoom: 1 }]);
    // Surface uses absolute zoom (1), while plane retains scale(5) until React commits zoom: 1 atomically.
    expect(surface.style.transform).toBe('translate3d(-400px, -500px, 0) scale(1)');
    expect(plane.style.transform).toBe('translate3d(-400px, -500px, 0) scale(5)');
    vi.restoreAllMocks();
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

  it('zooms back out to 1.0 when double-tapping background at max zoom even with slight touch jitter', () => {
    updates.length = 0;
    const { containerProps: handlers } = useCorkboardGestures({
      initialViewport: { x: 900, y: 900, zoom: 2.0 },
    });

    // First tap with 8px touch jitter (within 12px touch slop)
    handlers.onPointerDown(pointer(1, 200, 300));
    handlers.onPointerMove(pointer(1, 206, 305));
    handlers.onPointerUp(pointer(1, 206, 305));

    // Second tap shortly after
    handlers.onPointerDown(pointer(2, 204, 302));
    handlers.onPointerUp(pointer(2, 204, 302));
    flushFrame();

    expect(updates[updates.length - 1]).toMatchObject({ zoom: 1.0 });
  });

  it('zooms back out to 1.0 when double-tapping a card while zoomed in all the way', () => {
    updates.length = 0;
    const onTapBackground = vi.fn();
    const { containerProps: handlers } = useCorkboardGestures({
      initialViewport: { x: 900, y: 900, zoom: 2.0 },
      onTapBackground,
    });
    const cardPointer = (id: number, x: number, y: number) => {
      const ev = pointer(id, x, y);
      ev.target = { closest: (selector: string) => selector.includes('.corkboard-node-card') ? {} : null } as unknown as EventTarget;
      return ev;
    };

    handlers.onPointerDownCapture(cardPointer(1, 200, 300));
    handlers.onPointerUpCapture(cardPointer(1, 200, 300));
    handlers.onPointerDownCapture(cardPointer(2, 205, 304));
    handlers.onPointerUpCapture(cardPointer(2, 205, 304));
    flushFrame();

    expect(onTapBackground).toHaveBeenCalledTimes(1);
    expect(updates[updates.length - 1]).toMatchObject({ zoom: 1.0 });
  });
});



import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ComponentProps, PointerEvent, ReactElement } from 'react';
import { NotebookTab } from './NotebookTab';

vi.mock('react', async importOriginal => ({
  ...await importOriginal<typeof import('react')>(),
  useRef: (current: unknown) => ({ current }),
  useState: (initial: unknown) => [initial, vi.fn()],
  useLayoutEffect: () => undefined,
}));

describe('evidence board overlay trigger button', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) });
    vi.stubGlobal('getComputedStyle', () => ({ transform: 'none' }));
  });
  afterEach(() => vi.unstubAllGlobals());

  function setup(overrides: Partial<ComponentProps<typeof NotebookTab>> = {}) {
    const onOpen = vi.fn();
    const tab = NotebookTab({ open: false, onOpen, ...overrides }) as ReactElement<ComponentProps<'button'>>;
    const host = { getBoundingClientRect: () => ({ left: 0, top: 0, width: 390, height: 844 }), offsetWidth: 390, offsetHeight: 844, clientLeft: 0, clientTop: 0 };
    const button = { offsetParent: host, getBoundingClientRect: () => ({ left: 254, top: 700 }), querySelector: () => null, setPointerCapture: vi.fn(), style: {}, dataset: {} };
    const event = (x: number, y: number, type = 'pointerup', timeStamp?: number) => ({
      currentTarget: button, clientX: x, clientY: y, pointerId: 1, button: 0, isPrimary: true,
      timeStamp: timeStamp ?? (type === 'pointerdown' ? 0 : 50), type, detail: 1, stopPropagation: vi.fn(),
    });
    const down = () => tab.props.onPointerDown?.(event(300, 720, 'pointerdown') as unknown as PointerEvent<HTMLButtonElement>);
    const move = (x: number, y: number, timeStamp = 30) => {
      tab.props.onPointerMove?.(event(x, y, 'pointermove', timeStamp) as unknown as PointerEvent<HTMLButtonElement>);
    };
    const release = (x: number, y: number, cancel = false) => {
      const releaseEvent = event(x, y, cancel ? 'pointercancel' : 'pointerup') as unknown as PointerEvent<HTMLButtonElement>;
      if (cancel) tab.props.onPointerCancel?.(releaseEvent); else tab.props.onPointerUp?.(releaseEvent);
      tab.props.onClick?.(releaseEvent);
    };
    return { onOpen, button, down, move, release };
  }

  it('opens on a short tap', () => {
    const tab = setup();
    tab.down();
    tab.release(301, 721);
    expect(tab.onOpen).toHaveBeenCalledOnce();
  });

  it('suppresses click and docks on right edge after dragging vertically', () => {
    const tab = setup();
    tab.down();
    tab.move(300, 620, 40);
    tab.release(300, 620);
    expect(tab.onOpen).not.toHaveBeenCalled();
    expect(tab.button.dataset).toMatchObject({ edge: 'right', floating: 'false' });
    expect((tab.button.style as { transform?: string }).transform).toMatch(/^translate3d\(254px, /);
  });

  it('suppresses cancelled gestures and permits a fresh tap afterward', () => {
    const tab = setup();
    tab.down();
    tab.release(300, 720, true);
    expect(tab.onOpen).not.toHaveBeenCalled();
    tab.down();
    tab.release(300, 720);
    expect(tab.onOpen).toHaveBeenCalledOnce();
  });

  it('hides and disables pointer events when open or hidden is true', () => {
    for (const props of [{ open: true, hidden: false }, { open: false, hidden: true }]) {
      const tab = NotebookTab({ ...props, onOpen: vi.fn() }) as ReactElement<ComponentProps<'button'>>;
      expect(tab.props.style?.opacity).toBe(0);
      expect(tab.props.style?.pointerEvents).toBe('none');
      expect(tab.props['aria-hidden']).toBe(true);
      expect(tab.props.tabIndex).toBe(-1);
    }
  });

  it('renders Peaksy overlay badge count and zero-padded case number', () => {
    const html = renderToStaticMarkup(<NotebookTab open={false} evidenceCount={8} caseNumber={1} onOpen={vi.fn()} />);
    expect(html).toContain('data-evidence-badge');
    expect(html).toContain('>8<');
    expect(html).toContain('VỤ ÁN');
    expect(html).toContain('>01<');
    expect(html).toContain('bg-[#EF4444]');
  });
});

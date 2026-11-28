import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isFloatingDrag } from './floatingControlPosition';
import {
  ControlCenter,
  isControlSwipe,
  isNotificationHintSeen,
  setNotificationHintSeen,
  NOTIFICATION_HINT_KEY,
} from './ControlCenter';

describe('system control gesture ownership', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    const mockStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => store.set(key, String(val)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
      length: 0,
      key: () => null,
    };
    vi.stubGlobal('localStorage', mockStorage);
    if (typeof window !== 'undefined') {
      window.localStorage = mockStorage as unknown as Storage;
    }
  });

  it('keeps short notebook taps distinct from dragging in every direction', () => {
    expect(isFloatingDrag(2, 3)).toBe(false);
    expect(isFloatingDrag(-38, 5)).toBe(true);
    expect(isFloatingDrag(-4, 38)).toBe(true);
    expect(isFloatingDrag(-10, -28)).toBe(true);
    expect(isFloatingDrag(38, 0)).toBe(true);
  });

  it('requires dominant vertical travel and the correct direction for Control Center', () => {
    expect(isControlSwipe(4, 60, 'down')).toBe(true);
    expect(isControlSwipe(4, -60, 'up')).toBe(true);
    expect(isControlSwipe(4, -60, 'down')).toBe(false);
    expect(isControlSwipe(60, 60, 'down')).toBe(false);
    expect(isControlSwipe(0, 20, 'down')).toBe(false);
  });

  it('persists notification hint seen state in localStorage', () => {
    expect(isNotificationHintSeen()).toBe(false);
    setNotificationHintSeen();
    expect(isNotificationHintSeen()).toBe(true);
    expect(store.get(NOTIFICATION_HINT_KEY)).toBe('true');
  });

  it('renders initial down chevron hint on first load, and removes it once seen', () => {
    // 1. First load: hint seen is false, so hint chevron is rendered
    const initialHtml = renderToStaticMarkup(
      <ControlCenter
        disabled={false}
        isFullscreen={false}
        onToggleFullscreen={() => {}}
        onGoHome={() => {}}
        onOpenLevels={() => {}}
        onOpenChange={() => {}}
      />
    );
    expect(initialHtml).toContain('data-notification-swipe-hint');
    expect(initialHtml).not.toContain('bg-slate-900/35'); // Permanent status bar chevron removed

    // 2. Mark hint as seen
    setNotificationHintSeen();

    // 3. Subsequent load: hint is no longer rendered
    const subsequentHtml = renderToStaticMarkup(
      <ControlCenter
        disabled={false}
        isFullscreen={false}
        onToggleFullscreen={() => {}}
        onGoHome={() => {}}
        onOpenLevels={() => {}}
        onOpenChange={() => {}}
      />
    );
    expect(subsequentHtml).not.toContain('data-notification-swipe-hint');
    expect(subsequentHtml).not.toContain('bg-slate-900/35');
  });

  it('uses a flicker-free translucent scrim on the overlay without backdrop blur', () => {
    const html = renderToStaticMarkup(
      <ControlCenter
        disabled={false}
        isFullscreen={false}
        onToggleFullscreen={() => {}}
        onGoHome={() => {}}
        onOpenLevels={() => {}}
        onOpenChange={() => {}}
      />
    );
    expect(html).toContain('bg-slate-950/80');
    expect(html).not.toContain('backdrop-blur-md');
    expect(html).not.toContain('backdrop-blur-2xl');
  });

  it('renders status bar trigger covering system bar height and meeting touch target minimums', () => {
    const html = renderToStaticMarkup(
      <ControlCenter
        disabled={false}
        isFullscreen={false}
        onToggleFullscreen={() => {}}
        onGoHome={() => {}}
        onOpenLevels={() => {}}
        onOpenChange={() => {}}
      />
    );
    expect(html).toContain('data-control-center-trigger');
    expect(html).toContain('h-[var(--phone-system-top,59px)]');
    expect(html).toContain('min-h-[44px]');
  });

  it('renders stationary blur backdrop and sliding panel when controlled open is true', () => {
    const html = renderToStaticMarkup(
      <ControlCenter
        open={true}
        disabled={false}
        isFullscreen={false}
        onToggleFullscreen={() => {}}
        onGoHome={() => {}}
        onOpenLevels={() => {}}
        onOpenChange={() => {}}
      />
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('transition-opacity');
    expect(html).toContain('transition-transform');
    expect(html).toContain('translate-y-0');
    expect(html).toContain('Trung tâm điều khiển');
  });

  it('does not render initial chevron hint when status bar is not shown', () => {
    const html = renderToStaticMarkup(
      <ControlCenter
        disabled={false}
        isFullscreen={false}
        showStatusBar={false}
        onToggleFullscreen={() => {}}
        onGoHome={() => {}}
        onOpenLevels={() => {}}
        onOpenChange={() => {}}
      />
    );
    expect(html).not.toContain('data-notification-swipe-hint');
  });
});


import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNavigationGuard, type TargetWindow } from './useNavigationGuard';
import { ExitConfirmModal } from './components/ExitConfirmModal';
import { PhoneShell, type PhoneShellProps } from './PhoneShell';
import type { AppDefinition } from '../shared/contracts/app-contracts';

function createMockWindow(initialState: unknown = null): {
  win: TargetWindow;
  listeners: Map<string, Set<(event: Event) => void>>;
  pushStateCalls: Array<{ data: unknown; unused: string; url?: string | URL | null }>;
  goCalls: number[];
  dispatch: (type: string, event?: Event | unknown) => void;
} {
  let state = initialState;
  const listeners = new Map<string, Set<(event: Event) => void>>();
  const pushStateCalls: Array<{ data: unknown; unused: string; url?: string | URL | null }> = [];
  const goCalls: number[] = [];

  const win: TargetWindow = {
    history: {
      get state() {
        return state;
      },
      pushState: vi.fn((data: unknown, unused: string, url?: string | URL | null) => {
        state = data;
        pushStateCalls.push({ data, unused, url });
      }),
      go: vi.fn((delta = 0) => {
        goCalls.push(delta);
      }),
    },
    addEventListener: vi.fn((type: string, listener: (event: Event) => void) => {
      if (!listeners.has(type)) {
        listeners.set(type, new Set());
      }
      listeners.get(type)!.add(listener);
    }),
    removeEventListener: vi.fn((type: string, listener: (event: Event) => void) => {
      listeners.get(type)?.delete(listener);
    }),
  };

  const dispatch = (type: string, event: Event | unknown = {}) => {
    listeners.get(type)?.forEach((listener) => listener(event as Event));
  };

  return { win, listeners, pushStateCalls, goCalls, dispatch };
}

describe('createNavigationGuard History Trap Engine', () => {
  it('arms history trap on init by pushing { guard: "exit" }', () => {
    const { win, pushStateCalls } = createMockWindow();
    const engine = createNavigationGuard({ targetWindow: win });

    expect(pushStateCalls).toHaveLength(1);
    expect(pushStateCalls[0].data).toEqual({ guard: 'exit' });
    expect(engine.isArmed()).toBe(true);
    expect(win.addEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
    expect(win.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('does not push duplicate state if window history is already trapped', () => {
    const { win, pushStateCalls } = createMockWindow({ guard: 'exit' });
    const engine = createNavigationGuard({ targetWindow: win });

    expect(pushStateCalls).toHaveLength(0);
    expect(engine.isArmed()).toBe(true);
  });

  it('does not push state or register listeners when enabled is false', () => {
    const { win, pushStateCalls } = createMockWindow();
    const engine = createNavigationGuard({ enabled: false, targetWindow: win });

    expect(pushStateCalls).toHaveLength(0);
    expect(win.addEventListener).not.toHaveBeenCalled();
    expect(engine.isArmed()).toBe(false);
  });

  it('intercepts popstate by re-pushing trap and triggering onOpenConfirm', () => {
    const { win, pushStateCalls, dispatch } = createMockWindow();
    const onOpenConfirm = vi.fn();
    createNavigationGuard({ targetWindow: win, onOpenConfirm });

    expect(pushStateCalls).toHaveLength(1);

    // Simulate mobile browser edge-swipe popstate
    dispatch('popstate', {});

    expect(pushStateCalls).toHaveLength(2);
    expect(pushStateCalls[1].data).toEqual({ guard: 'exit' });
    expect(onOpenConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCloseConfirm when user chooses stay ("Tiếp tục chơi")', () => {
    const { win } = createMockWindow();
    const onCloseConfirm = vi.fn();
    const engine = createNavigationGuard({ targetWindow: win, onCloseConfirm });

    engine.stay();
    expect(onCloseConfirm).toHaveBeenCalledTimes(1);
    expect(engine.isLeaving()).toBe(false);
  });

  it('removes listeners and triggers history.go(-2) when user chooses leave ("Rời khỏi")', () => {
    const { win, goCalls, listeners } = createMockWindow();
    const onCloseConfirm = vi.fn();
    const onLeave = vi.fn();
    const engine = createNavigationGuard({ targetWindow: win, onCloseConfirm, onLeave });

    expect(listeners.get('popstate')?.size).toBe(1);
    expect(listeners.get('beforeunload')?.size).toBe(1);

    engine.leave();

    expect(engine.isLeaving()).toBe(true);
    expect(onCloseConfirm).toHaveBeenCalledTimes(1);
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(goCalls).toEqual([-2]);
    expect(win.removeEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
    expect(win.removeEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    expect(listeners.get('popstate')?.size).toBe(0);
    expect(listeners.get('beforeunload')?.size).toBe(0);
  });

  it('traps beforeunload events to prevent native tab close or reload', () => {
    const { win, dispatch } = createMockWindow();
    createNavigationGuard({ targetWindow: win });

    const preventDefaultSpy = vi.fn();
    const fakeEvent = { preventDefault: preventDefaultSpy, returnValue: '' };

    dispatch('beforeunload', fakeEvent);

    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    expect(fakeEvent.returnValue).toBe('');
  });

  it('does not trap beforeunload if user has already confirmed leaving', () => {
    const { win, dispatch } = createMockWindow();
    const engine = createNavigationGuard({ targetWindow: win });

    engine.leave();

    const preventDefaultSpy = vi.fn();
    const fakeEvent = { preventDefault: preventDefaultSpy, returnValue: 'initial' };

    dispatch('beforeunload', fakeEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(fakeEvent.returnValue).toBe('initial');
  });

  it('cleans up listeners on dispose()', () => {
    const { win, listeners } = createMockWindow();
    const engine = createNavigationGuard({ targetWindow: win });

    expect(listeners.get('popstate')?.size).toBe(1);
    engine.dispose();
    expect(listeners.get('popstate')?.size).toBe(0);
    expect(win.removeEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
    expect(win.removeEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
});

describe('ExitConfirmModal Component', () => {
  it('returns null when isOpen is false', () => {
    const html = renderToStaticMarkup(
      <ExitConfirmModal isOpen={false} onStay={() => {}} onLeave={() => {}} />
    );
    expect(html).toBe('');
  });

  it('renders alertdialog with accessible title, description, and actions when open', () => {
    const html = renderToStaticMarkup(
      <ExitConfirmModal isOpen={true} onStay={() => {}} onLeave={() => {}} />
    );

    expect(html).toContain('role="alertdialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-labelledby="exit-confirm-title"');
    expect(html).toContain('aria-describedby="exit-confirm-desc"');
    expect(html).toContain('Bạn có chắc muốn thoát game?');
    expect(html).toContain('Tiến trình điều tra hiện tại chưa lưu có thể bị gián đoạn');
    expect(html).toContain('Tiếp tục chơi');
    expect(html).toContain('Rời khỏi');
  });

  it('enforces touch target ergonomics >= 44px on both action buttons', () => {
    const html = renderToStaticMarkup(
      <ExitConfirmModal isOpen={true} onStay={() => {}} onLeave={() => {}} />
    );

    // Matches min-h-[44px] on both buttons
    const matches = html.match(/min-h-\[44px\]/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });

  it('renders iOS glass backdrop and modal container classes without em dashes', () => {
    const html = renderToStaticMarkup(
      <ExitConfirmModal isOpen={true} onStay={() => {}} onLeave={() => {}} />
    );

    expect(html).toContain('backdrop-blur-md');
    expect(html).toContain('bg-slate-900/95');
    // Workspace invariant: strictly zero em dashes
    expect(html).not.toContain('—');
  });
});

describe('PhoneShell with Navigation Guard', () => {
  const dummyApp: AppDefinition = {
    appId: 'banking',
    displayName: 'Banking',
    icon: () => null,
    component: () => null,
    themeGradient: '',
    themeColor: '#ED1C24',
    bottomBarColor: '#FFFFFF',
    isLocked: false,
  };

  const defaultProps: PhoneShellProps = {
    deviceMetadata: { narrativeTime: '23:45', batteryPercent: '42%', carrierTag: '', pwaThemeColor: '#ED1C24' },
    activeAppId: 'banking',
    activeAppDefinition: dummyApp,
    activeUpperApps: [dummyApp],
    activeDockApps: [],
    systemAlertToast: null,
    children: <div>App Content</div>,
    overlays: null,
    renderLevelSelector: () => null,
    onLaunchApp: () => {},
    onReturnHome: () => {},
    onRestartLevel: () => {},
    onOpenNotebook: () => {},
    onNotify: () => {},
  };

  beforeEach(() => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    vi.stubGlobal('navigator', { userAgent: 'Desktop', maxTouchPoints: 0 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders phone shell without rendering exit confirmation dialog initially', () => {
    const html = renderToStaticMarkup(<PhoneShell {...defaultProps} />);
    expect(html).toContain('phone-shell');
    expect(html).not.toContain('role="alertdialog"');
    expect(html).not.toContain('Bạn có chắc muốn thoát game?');
  });

  it('supports explicit enableNavigationGuard={false} prop', () => {
    const html = renderToStaticMarkup(
      <PhoneShell {...defaultProps} enableNavigationGuard={false} />
    );
    expect(html).toContain('phone-shell');
    expect(html).not.toContain('role="alertdialog"');
  });
});

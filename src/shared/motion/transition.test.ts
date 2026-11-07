import { afterEach, describe, expect, it, vi } from 'vitest';
import { appTransition, handoffSwipe, launcherFlight, navigationMotion, transition } from './transition';

afterEach(() => vi.unstubAllGlobals());

describe('motion navigation safety', () => {
  it('contracts the entire app surface, including system-bar backgrounds, into its icon', async () => {
    const properties = new Map<string, string>();
    const bounds = { x: 0, y: 0, width: 390, height: 844 };
    const icon = { getBoundingClientRect: () => ({ x: 20, y: 180, width: 60, height: 60 }) };
    const rules = { textContent: '' };
    let commit = () => {};
    let finish = () => {};
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    vi.stubGlobal('document', {
      documentElement: { dataset: {}, style: {
        setProperty: (name: string, value: string) => properties.set(name, value),
        removeProperty: (name: string) => properties.delete(name),
      } },
      querySelector: (selector: string) => selector === '[data-app-transition-bounds]' ? { getBoundingClientRect: () => bounds } : null,
      querySelectorAll: (selector: string) => selector === '[data-launch-app]'
        ? [{ dataset: { launchApp: 'banking' }, querySelector: () => icon }] : [],
      getElementById: () => rules,
      startViewTransition: (callback: () => void) => {
        commit = callback;
        return { skipTransition: vi.fn(), ready: Promise.resolve(), finished: new Promise<void>(resolve => { finish = resolve; }) };
      },
    });
    appTransition('close', 'banking', () => {});
    await Promise.resolve();
    expect(properties.get('--app-dx')).toBe('-145px');
    expect(properties.get('--app-dy')).toBe('-212px');
    expect(Number(properties.get('--app-scale-y'))).toBeCloseTo(60 / 844);
    expect(properties.get('--app-origin-x')).toBe('12.82%');
    expect(properties.get('--app-origin-y')).toBe('24.88%');
    commit();
    finish();
    await Promise.resolve();
  });
  it('moves neighboring icons outward from the tapped icon and holds the origin still', () => {
    expect(launcherFlight(50, 50, 50, 50, 390, 844)).toEqual({ x: 0, y: 0 });
    expect(launcherFlight(0, 50, 50, 50, 390, 844).x).toBeLessThan(-390);
    expect(launcherFlight(100, 50, 50, 50, 390, 844).x).toBeGreaterThan(390);
    expect(launcherFlight(50, 0, 50, 50, 390, 844).y).toBeLessThan(-844);
    expect(launcherFlight(50, 100, 50, 50, 390, 844).y).toBeGreaterThan(844);
  });
  it('derives push, pop, and same-depth tab changes', () => {
    expect(navigationMotion(null, 'thread')).toBe('push');
    expect(navigationMotion('thread', null)).toBe('pop');
    expect(navigationMotion(['home'], ['home', 'detail'])).toBe('push');
    expect(navigationMotion(['home', 'detail'], ['home'])).toBe('pop');
    expect(navigationMotion(['home'], ['profile'])).toBe('fade');
  });

  it('updates immediately without browser support or with reduced motion', () => {
    const update = vi.fn();
    vi.stubGlobal('document', {});
    transition('push', update);
    const startViewTransition = vi.fn();
    vi.stubGlobal('document', { startViewTransition });
    vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) });
    transition('push', update);
    expect(update).toHaveBeenCalledTimes(2);
    expect(startViewTransition).not.toHaveBeenCalled();
  });

  it('commits interrupted actions once and in order, even if browser callbacks arrive late', async () => {
    const callbacks: (() => void)[] = [];
    const finishes: (() => void)[] = [];
    const skip = vi.fn();
    const root = { dataset: {} as Record<string, string> };
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    vi.stubGlobal('document', {
      documentElement: root,
      startViewTransition: (callback: () => void) => {
        callbacks.push(callback);
        return { skipTransition: skip, ready: Promise.resolve(), finished: new Promise<void>(resolve => finishes.push(resolve)) };
      },
    });
    const actions: string[] = [];
    transition('push', () => actions.push('open'));
    await Promise.resolve();
    transition('pop', () => actions.push('back'));
    await Promise.resolve();
    callbacks[1]();
    callbacks[0]();
    expect(actions).toEqual(['open', 'back']);
    expect(skip).toHaveBeenCalledOnce();
    finishes[0]();
    await Promise.resolve();
    expect(root.dataset.motion).toBe('pop');
    finishes[1]();
    await Promise.resolve();
    expect(root.dataset.motion).toBeUndefined();
  });

  it('clears snapshot styling when reduced motion interrupts an active transition', async () => {
    const root = { dataset: {} as Record<string, string> };
    let callback = () => {};
    let finish = () => {};
    let reduce = false;
    const skip = vi.fn();
    vi.stubGlobal('window', { matchMedia: () => ({ matches: reduce }) });
    vi.stubGlobal('document', {
      documentElement: root,
      startViewTransition: (update: () => void) => {
        callback = update;
        return { skipTransition: skip, ready: Promise.resolve(), finished: new Promise<void>(resolve => { finish = resolve; }) };
      },
    });
    const actions: string[] = [];
    transition('open', () => actions.push('open'));
    await Promise.resolve();
    reduce = true;
    transition('close', () => actions.push('home'));
    callback();
    finish();
    await Promise.resolve();
    expect(actions).toEqual(['open', 'home']);
    expect(skip).toHaveBeenCalledOnce();
    expect(root.dataset.motion).toBeUndefined();
  });

  it('batches overlay dismissal and app navigation into one capture without dropping either update', async () => {
    const root = { dataset: {} as Record<string, string> };
    let commit = () => {};
    let finish = () => {};
    const start = vi.fn((callback: () => void) => {
      commit = callback;
      return { skipTransition: vi.fn(), ready: Promise.resolve(), finished: new Promise<void>(resolve => { finish = resolve; }) };
    });
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    vi.stubGlobal('document', { documentElement: root, startViewTransition: start });
    const actions: string[] = [];
    transition('sheet-out', () => actions.push('dismiss'));
    transition('close', () => actions.push('home'));
    expect(start).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(start).toHaveBeenCalledOnce();
    expect(root.dataset.motion).toBe('close');
    commit();
    commit();
    expect(actions).toEqual(['dismiss', 'home']);
    finish();
    await Promise.resolve();
  });

  it('keeps swipe displacement until capture and restores before committing navigation', async () => {
    let commit = () => {};
    let finish = () => {};
    const restore = vi.fn();
    const navigate = vi.fn();
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    vi.stubGlobal('document', { documentElement: { dataset: {} }, startViewTransition: (callback: () => void) => {
      commit = callback;
      return { skipTransition: vi.fn(), ready: Promise.resolve(), finished: new Promise<void>(resolve => { finish = resolve; }) };
    } });
    handoffSwipe(90, restore, () => transition('pop', () => {
      expect(restore).toHaveBeenCalledOnce();
      navigate();
    }));
    await Promise.resolve();
    expect(restore).not.toHaveBeenCalled();
    commit();
    expect(navigate).toHaveBeenCalledOnce();
    finish();
    await Promise.resolve();
  });

  it('captures only app content for a fade and restores names after capture', async () => {
    const oldRegion = { style: { viewTransitionName: '' } };
    const newRegion = { style: { viewTransitionName: '' } };
    let region = oldRegion;
    let commit = () => {};
    let ready = () => {};
    let finish = () => {};
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    vi.stubGlobal('document', {
      documentElement: { dataset: {} }, querySelector: () => region,
      startViewTransition: (callback: () => void) => {
        expect(oldRegion.style.viewTransitionName).toBe('app-content');
        commit = callback;
        return { skipTransition: vi.fn(), ready: new Promise<void>(resolve => { ready = resolve; }), finished: new Promise<void>(resolve => { finish = resolve; }) };
      },
    });
    transition('fade', () => { region = newRegion; });
    await Promise.resolve();
    commit();
    expect(newRegion.style.viewTransitionName).toBe('app-content');
    ready();
    await Promise.resolve();
    expect(oldRegion.style.viewTransitionName).toBe('');
    expect(newRegion.style.viewTransitionName).toBe('');
    finish();
    await Promise.resolve();
  });

  it('restores the original region name when an unfinished capture is interrupted', async () => {
    const region = { style: { viewTransitionName: '' } };
    const callbacks: (() => void)[] = [];
    const ready: (() => void)[] = [];
    const finished: (() => void)[] = [];
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    vi.stubGlobal('document', {
      documentElement: { dataset: {} }, querySelector: () => region,
      startViewTransition: (callback: () => void) => {
        callbacks.push(callback);
        return { skipTransition: vi.fn(), ready: new Promise<void>(resolve => ready.push(resolve)), finished: new Promise<void>(resolve => finished.push(resolve)) };
      },
    });
    transition('fade', () => {});
    await Promise.resolve();
    transition('fade', () => {});
    await Promise.resolve();
    callbacks[1]();
    ready[0]();
    finished[0]();
    await Promise.resolve();
    expect(region.style.viewTransitionName).toBe('app-content');
    ready[1]();
    finished[1]();
    await Promise.resolve();
    expect(region.style.viewTransitionName).toBe('');
  });

  it('commits every queued update immediately if reduced motion is enabled before capture', async () => {
    let reduce = false;
    const start = vi.fn();
    vi.stubGlobal('window', { matchMedia: () => ({ matches: reduce }) });
    vi.stubGlobal('document', { documentElement: { dataset: {} }, startViewTransition: start });
    const updates: string[] = [];
    transition('push', () => updates.push('detail'));
    reduce = true;
    transition('pop', () => updates.push('back'));
    await Promise.resolve();
    expect(updates).toEqual(['detail', 'back']);
    expect(start).not.toHaveBeenCalled();
  });

  it('keeps navigation working if the browser cannot start a snapshot', async () => {
    const region = { style: { viewTransitionName: '' } };
    const root = { dataset: {} as Record<string, string> };
    vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
    vi.stubGlobal('document', { documentElement: root, querySelector: () => region,
      startViewTransition: () => { throw new Error('unavailable'); } });
    const update = vi.fn();
    transition('fade', update);
    await Promise.resolve();
    expect(update).toHaveBeenCalledOnce();
    expect(region.style.viewTransitionName).toBe('');
    expect(root.dataset.motion).toBeUndefined();
  });
});

import { flushSync } from 'react-dom';

export type MotionKind = 'open' | 'close' | 'push' | 'pop' | 'fade' | 'sheet-in' | 'sheet-out';
interface TransitionHandle {
  skipTransition(): void;
  ready: Promise<void>;
  finished: Promise<void>;
}
let active: { handle: TransitionHandle; commit: () => void } | undefined;
interface MotionRequest {
  kind: MotionKind;
  updates: (() => void)[];
  prepare?: () => void;
  restoreGesture?: () => void;
  swipeDistance?: number;
}
let pending: MotionRequest | undefined;
let committing = false;
const regionOwners = new WeakMap<HTMLElement, { owner: symbol; name: string }>();
let swipe: { restore: () => void; distance: number; consumed: boolean } | undefined;
const priority: Record<MotionKind, number> = {
  fade: 0, 'sheet-in': 1, 'sheet-out': 1, push: 2, pop: 2, open: 3, close: 3,
};

const canAnimate = () => typeof document !== 'undefined'
  && typeof document.startViewTransition === 'function'
  && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Keep the dragged surface in the outgoing snapshot; restore it only after capture. */
export function handoffSwipe(distance: number, restore: () => void, navigate: () => void): void {
  const current = { distance, restore, consumed: false };
  swipe = current;
  try { navigate(); } finally {
    swipe = undefined;
    if (!current.consumed) restore();
  }
}

export function launcherFlight(x: number, y: number, originX: number, originY: number, width: number, height: number) {
  const dx = x - originX;
  const dy = y - originY;
  const length = Math.hypot(dx, dy);
  if (length < 1) return { x: 0, y: 0 };
  const distance = Math.hypot(width, height);
  return { x: dx / length * distance, y: dy / length * distance };
}

/** Measure in viewport coordinates so compact and desktop shells share the same motion. */
export function appTransition(kind: 'open' | 'close', appId: string, update: () => void): void {
  transition(kind, update, () => prepareAppTransition(appId));
}

function prepareAppTransition(appId: string): void {
  if (typeof document !== 'undefined') {
    const viewport = document.querySelector('[data-app-transition-bounds]')?.getBoundingClientRect();
    const grid = document.querySelector<HTMLElement>('.phone-app-grid')?.getBoundingClientRect();
    const dock = document.querySelector<HTMLElement>('.phone-dock-grid')?.getBoundingClientRect();
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-launch-app]'));
    const icon = buttons.find(element => element.dataset.launchApp === appId)
      ?.querySelector('.phone-app-icon')?.getBoundingClientRect();
    const style = document.documentElement.style;
    const measured = viewport && icon && viewport.width > 0 && viewport.height > 0;
    const gridBounds = grid && grid.width > 0 && grid.height > 0 ? grid : viewport;
    const originX = measured && gridBounds ? ((icon.x + icon.width / 2 - gridBounds.x) / gridBounds.width) * 100 : 50;
    const originY = measured && gridBounds ? ((icon.y + icon.height / 2 - gridBounds.y) / gridBounds.height) * 100 : 50;
    const dockOriginX = measured && dock && dock.width > 0 ? ((icon.x + icon.width / 2 - dock.x) / dock.width) * 100 : 50;
    // Finish geometry reads before invalidating styles.
    style.setProperty('--app-dx', measured ? `${icon.x + icon.width / 2 - viewport.x - viewport.width / 2}px` : '0px');
    style.setProperty('--app-dy', measured ? `${icon.y + icon.height / 2 - viewport.y - viewport.height / 2}px` : '0px');
    style.setProperty('--app-scale-x', measured ? `${icon.width / viewport.width}` : '.96');
    style.setProperty('--app-scale-y', measured ? `${icon.height / viewport.height}` : '.96');
    style.setProperty('--app-origin-x', `${originX.toFixed(2)}%`);
    style.setProperty('--app-origin-y', `${originY.toFixed(2)}%`);
    style.setProperty('--dock-origin-x', `${dockOriginX.toFixed(2)}%`);
  }
}

/** One browser capture for all presentation updates in the same event. */
export function transition(kind: MotionKind, update: () => void, prepare?: () => void): void {
  if (committing) { update(); return; }
  if (!canAnimate()) {
    flushPending();
    active?.commit();
    active?.handle.skipTransition();
    active = undefined;
    if (typeof document !== 'undefined') {
      delete document.documentElement?.dataset.motion;
      delete document.documentElement?.dataset.swipeMotion;
      document.documentElement?.style?.removeProperty('--swipe-distance');
    }
    if (swipe) { swipe.consumed = true; swipe.restore(); }
    update();
    return;
  }
  if (!pending) {
    pending = { kind, updates: [], prepare };
    queueMicrotask(flushPending);
  }
  if (priority[kind] >= priority[pending.kind]) {
    pending.kind = kind;
    pending.prepare = prepare;
  }
  pending.updates.push(update);
  if (swipe && !swipe.consumed) {
    swipe.consumed = true;
    pending.restoreGesture = swipe.restore;
    pending.swipeDistance = swipe.distance;
  }
}

/** Detail screens stacked over a retained parent get their own snapshot so the parent never travels with them. */
function markLayered(): void {
  if (document.querySelector?.('[data-app-instance]:not([hidden]) [data-detail-layer], [data-detail-layer]:not([data-app-instance] [data-detail-layer])')) document.documentElement.dataset.layered = '';
}

function flushPending(): void {
  const request = pending;
  if (!request) return;
  pending = undefined;
  // A skipped browser transition still runs its callback. Commit it once, in order,
  // before accepting another action, including reduced-motion/fallback actions.
  active?.commit();
  active?.handle.skipTransition();
  active = undefined;
  let committed = false;
  const owner = Symbol();
  const regions = new Map<HTMLElement, string>();
  const settleEntrances = () => {
    for (const element of document.querySelectorAll?.<HTMLElement>(
      ':is(.animate-fadeIn, .animate-slideUp, .animate-slideDown, .animate-scaleUp):not([data-snapshot-motion])',
    ) ?? []) element.setAttribute('data-snapshot-motion', '');
  };
  const nameContent = () => {
    if (request.kind !== 'fade') return;
    const region = document.querySelector?.<HTMLElement>('[data-app-instance]:not([hidden]) main, [data-app-instance]:not([hidden]) [data-motion-content]')
      ?? document.querySelector?.<HTMLElement>('[data-app-viewport] > main, [data-app-viewport] > [data-motion-content]');
    if (!region || regions.has(region)) return;
    const name = regionOwners.get(region)?.name ?? region.style.viewTransitionName;
    regions.set(region, name);
    regionOwners.set(region, { owner, name });
    region.style.viewTransitionName = 'app-content';
  };
  const restoreRegions = () => {
    for (const [region, name] of regions) {
      if (regionOwners.get(region)?.owner !== owner) continue;
      region.style.viewTransitionName = name;
      regionOwners.delete(region);
    }
    regions.clear();
  };
  const commit = () => {
    if (committed) return;
    committed = true;
    committing = true;
    try {
      request.restoreGesture?.();
      flushSync(() => { for (const update of request.updates) update(); });
      if (canAnimate()) { settleEntrances(); nameContent(); markLayered(); }
    } finally { committing = false; }
  };
  if (!canAnimate()) { commit(); return; }
  request.prepare?.();
  document.documentElement.dataset.motion = request.kind;
  delete document.documentElement.dataset.layered;
  markLayered();
  if (request.swipeDistance) document.documentElement.dataset.swipeMotion = '';
  else delete document.documentElement.dataset.swipeMotion;
  document.documentElement.style?.setProperty('--swipe-distance', `${request.swipeDistance ?? 0}px`);
  settleEntrances();
  nameContent();
  let handle: TransitionHandle;
  try { handle = document.startViewTransition(commit); } catch {
    commit();
    restoreRegions();
    delete document.documentElement.dataset.motion;
    delete document.documentElement.dataset.swipeMotion;
    delete document.documentElement.dataset.layered;
    document.documentElement.style?.removeProperty('--swipe-distance');
    return;
  }
  const current = { handle, commit };
  active = current;
  // ready rejects normally when interrupted, hidden, or snapshots cannot be taken.
  void handle.ready.then(restoreRegions, restoreRegions);
  const cleanup = () => {
    restoreRegions();
    if (active !== current) return;
    active = undefined;
    delete document.documentElement.dataset.motion;
    delete document.documentElement.dataset.swipeMotion;
    delete document.documentElement.dataset.layered;
    document.documentElement.style?.removeProperty('--swipe-distance');
  };
  void handle.finished.then(cleanup, cleanup);
}

export function navigationMotion(previous: unknown, next: unknown): MotionKind {
  if (Array.isArray(previous) && Array.isArray(next)) {
    return next.length === previous.length ? 'fade' : next.length > previous.length ? 'push' : 'pop';
  }
  if (next == null || next === false) return 'pop';
  if (previous == null || previous === false) return 'push';
  return 'fade';
}

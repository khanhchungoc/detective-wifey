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
  lift?: LiftPose;
}
/** Pose of an app card dragged up by the home gesture; the close sling starts from it. */
export interface LiftPose { x: number; y: number; scale: number; radius: number }
interface LiftHandoff { pose: LiftPose; restore: () => void; consumed: boolean }
let lift: LiftHandoff | undefined;
const LIFT_VARS = ['--lift-tx', '--lift-ty', '--lift-scale', '--lift-radius'] as const;
const clearLift = () => {
  for (const name of LIFT_VARS) document.documentElement?.style?.removeProperty(name);
  if (document.documentElement?.dataset) delete document.documentElement.dataset.lift;
};
/** Target launcher icon gets its own snapshot on close so it can crossfade with the app card. */
let namedIcon: HTMLElement | undefined;
const releaseIcon = () => { if (namedIcon) namedIcon.style.viewTransitionName = ''; namedIcon = undefined; };
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

/**
 * Swipe-home handoff: the lifted card stays in the outgoing snapshot (no full-size flash) and
 * its pose is replayed as CSS variables, so the close sling animates the whole card group from
 * the finger pose to the icon.
 */
export function handoffLift(pose: LiftPose, restore: () => void, navigate: () => void): void {
  const current: LiftHandoff = { pose, restore, consumed: false };
  lift = current;
  try { navigate(); } finally {
    lift = undefined;
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
  transition(kind, update, () => prepareAppTransition(appId, kind));
}

function prepareAppTransition(appId: string, kind: 'open' | 'close'): void {
  if (typeof document !== 'undefined') {
    const viewport = document.querySelector('[data-app-transition-bounds]')?.getBoundingClientRect();
    const grid = document.querySelector<HTMLElement>('.phone-app-grid')?.getBoundingClientRect();
    const dock = document.querySelector<HTMLElement>('.phone-dock-grid')?.getBoundingClientRect();
    const buttons = Array.from(document.querySelectorAll<HTMLElement>('[data-launch-app]'));
    const launcher = buttons.find(element => element.dataset.launchApp === appId);
    const icon = launcher?.querySelector('.phone-app-icon')?.getBoundingClientRect();
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
    style.setProperty('--app-x0', `${viewport?.x ?? 0}px`);
    style.setProperty('--app-y0', `${viewport?.y ?? 0}px`);
    // Launcher squircle corner (22.5% of icon width) so the card corners land on the icon's shape.
    style.setProperty('--icon-radius', `${measured ? icon.width * 0.225 : 14}px`);
    releaseIcon();
    // Whole launcher button (icon, badge, label) so nothing of it floats while the card flies in.
    if (kind === 'close' && measured && launcher) {
      launcher.style.viewTransitionName = 'phone-app-icon';
      namedIcon = launcher;
    }
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
    if (lift) { lift.consumed = true; lift.restore(); }
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
  if (lift && !lift.consumed) {
    lift.consumed = true;
    pending.lift = lift.pose;
    pending.restoreGesture = lift.restore;
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
  clearLift();
  if (request.lift) {
    const pose = request.lift;
    const style = document.documentElement.style;
    style?.setProperty('--lift-tx', `${pose.x}px`);
    style?.setProperty('--lift-ty', `${pose.y}px`);
    style?.setProperty('--lift-scale', `${pose.scale}`);
    style?.setProperty('--lift-radius', `${pose.radius}px`);
    document.documentElement.dataset.lift = '';
  }
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
    clearLift();
    releaseIcon();
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
    releaseIcon();
    delete document.documentElement.dataset.motion;
    delete document.documentElement.dataset.swipeMotion;
    delete document.documentElement.dataset.layered;
    document.documentElement.style?.removeProperty('--swipe-distance');
    clearLift();
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

import type { HusbandProfile, LevelCardItem } from '../../../shared/contracts/game-flow';

export const SELECT_DEBOUNCE_MS = 400;
export const LOCKED_LEVEL_FEEDBACK =
  'Bạn cần vượt qua màn chơi trước để mở khóa màn này';

/** Fraction of one page the finger must travel before a release counts as a page turn. */
export const PAGE_TURN_RATIO = 0.2;
/** Flick speed (px/s) that turns a page even when the drag distance is short. */
export const FLICK_VELOCITY_PX_S = 450;
/** Movement before a touch is treated as a drag (tap otherwise). */
export const DRAG_START_PX = 8;

export function resolveInitialHusbandIndex(
  husbands: HusbandProfile[],
  initialHusbandId?: string,
): number {
  if (husbands.length === 0 || !initialHusbandId) return 0;
  const idx = husbands.findIndex((h) => h.husbandId === initialHusbandId);
  return idx >= 0 ? idx : 0;
}

export function clampPageIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(total - 1, index));
}

/**
 * Decides which page a drag release lands on. Moves at most one page.
 * Dragging left (dx < 0) advances to the next page.
 */
export function resolvePagerTarget(params: {
  baseIndex: number;
  dx: number;
  velocityX: number;
  stridePx: number;
  total: number;
}): number {
  const { baseIndex, dx, velocityX, stridePx, total } = params;
  const base = clampPageIndex(baseIndex, total);
  if (stridePx <= 0) return base;
  const travelled = -dx / stridePx;
  let step = 0;
  if (Math.abs(travelled) >= PAGE_TURN_RATIO) {
    step = travelled > 0 ? 1 : -1;
  } else if (Math.abs(velocityX) >= FLICK_VELOCITY_PX_S && Math.abs(dx) >= DRAG_START_PX) {
    step = velocityX < 0 ? 1 : -1;
  }
  return clampPageIndex(base + step, total);
}

/** Elastic resistance past the first/last page so the stack never drags into empty space. */
export function applyRubberBand(pos: number, total: number, resistance = 0.35): number {
  const max = Math.max(0, total - 1);
  if (pos < 0) return pos * resistance;
  if (pos > max) return max + (pos - max) * resistance;
  return pos;
}

/** Opens on the highest unlocked playable case; falls back to the first non-guide file, then the first file. */
export function resolveDefaultLevelIndex(levels: LevelCardItem[]): number {
  let best = -1;
  levels.forEach((lvl, idx) => {
    if (lvl.isGuide || !lvl.unlocked) return;
    if (best < 0 || lvl.levelNumber > levels[best].levelNumber) best = idx;
  });
  if (best >= 0) return best;
  const firstPlayable = levels.findIndex((lvl) => !lvl.isGuide);
  return firstPlayable >= 0 ? firstPlayable : 0;
}

export function canStartLevel(level: LevelCardItem): boolean {
  return level.unlocked && !level.isGuide && !level.comingSoon;
}

export function evaluateLevelCardClick(
  level: LevelCardItem,
  husbandComingSoon: boolean,
  lastSelectTimestamp: number,
  now: number,
  debounceMs: number = SELECT_DEBOUNCE_MS,
): { action: 'select' | 'locked' | 'ignore'; feedback: string | null } {
  if (husbandComingSoon || level.isGuide || level.comingSoon) {
    return { action: 'ignore', feedback: null };
  }
  if (!level.unlocked) {
    return { action: 'locked', feedback: LOCKED_LEVEL_FEEDBACK };
  }
  if (now - lastSelectTimestamp < debounceMs) {
    return { action: 'ignore', feedback: null };
  }
  return { action: 'select', feedback: null };
}

/** Gap between consecutive sheets turning for one tab tap (seconds). */
export const SHEET_FLIP_STAGGER_S = 0.07;

export interface SheetFlip {
  sheet: number;
  /** Target state: true = turned over (out of the way), false = back on the stack. */
  flipped: boolean;
  /** Turn order, 0 first; multiply by the stagger for the start delay. */
  order: number;
}

/**
 * Binder model: sheets before the current one are flipped over. Moving forward from `from` to `to`
 * flips sheets from..to-1 in ascending order; moving back flips sheets to..from-1 back in reverse
 * (nearest the current sheet first).
 */
export function planSheetFlips(from: number, to: number): SheetFlip[] {
  const plan: SheetFlip[] = [];
  if (to > from) {
    for (let sheet = from; sheet < to; sheet += 1) plan.push({ sheet, flipped: true, order: sheet - from });
  } else if (to < from) {
    for (let sheet = from - 1; sheet >= to; sheet -= 1) plan.push({ sheet, flipped: false, order: from - 1 - sheet });
  }
  return plan;
}

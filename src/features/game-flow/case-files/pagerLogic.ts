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
  return level.unlocked && !level.comingSoon;
}

export function evaluateLevelCardClick(
  level: LevelCardItem,
  husbandComingSoon: boolean,
  lastSelectTimestamp: number,
  now: number,
  debounceMs: number = SELECT_DEBOUNCE_MS,
): { action: 'select' | 'locked' | 'ignore'; feedback: string | null } {
  if (husbandComingSoon || level.comingSoon) {
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

export const STACK_ACTIVE_Z = 30;
export const STACK_BACK_BASE_Z = 20;
export const STACK_MAX_Z_OFFSET = 15;
export const STACK_MAX_DEPTH = 3;
export const STACK_Y_STEP_PX = 2;
export const STACK_SCALE_STEP = 0.014;
export const STACK_SHADE_STEP = 0.06;

export interface SheetRestPose {
  zIndex: number;
  y: number;
  scale: number;
  shade: number;
}

/**
 * Physical manila-folder stack depth: active sheet sits in front (z 30, y 0, scale 1);
 * deeper sheets sit behind in distance order with subtle offset, scale, and ink shade.
 */
export function resolveSheetRestPose(index: number, activeIndex: number): SheetRestPose {
  const dist = Math.abs(index - activeIndex);
  if (dist === 0) {
    return { zIndex: STACK_ACTIVE_Z, y: 0, scale: 1, shade: 0 };
  }
  const depth = Math.min(dist, STACK_MAX_DEPTH);
  return {
    zIndex: STACK_BACK_BASE_Z - Math.min(dist, STACK_MAX_Z_OFFSET),
    y: depth * STACK_Y_STEP_PX,
    scale: 1 - depth * STACK_SCALE_STEP,
    shade: depth * STACK_SHADE_STEP,
  };
}

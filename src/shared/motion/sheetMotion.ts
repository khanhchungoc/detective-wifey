/**
 * Single source of truth for bottom sheet motion across all apps and shell sheets.
 * Smooth, fluid deceleration curve with zero spring overshoot.
 */
export const SHEET_OPEN_MS = 380;
export const SHEET_CLOSE_MS = 300;
export const SHEET_BACKDROP_OPEN_MS = 280;
export const SHEET_OPEN_EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
export const SHEET_CLOSE_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const SHEET_OPEN_BEZIER = [0.22, 0.61, 0.36, 1] as const;
export const SHEET_CLOSE_BEZIER = [0.4, 0, 0.2, 1] as const;

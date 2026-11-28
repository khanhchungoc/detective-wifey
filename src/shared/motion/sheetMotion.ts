/**
 * Single source of truth for bottom sheet motion across all apps and shell sheets.
 * Smooth, fluid ease curve with zero spring overshoot and no choppy slow-tail settle.
 */
export const SHEET_OPEN_MS = 280;
export const SHEET_CLOSE_MS = 240;
export const SHEET_BACKDROP_OPEN_MS = 220;
export const SHEET_OPEN_EASE = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
export const SHEET_CLOSE_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const SHEET_OPEN_BEZIER = [0.25, 0.1, 0.25, 1] as const;
export const SHEET_CLOSE_BEZIER = [0.4, 0, 0.2, 1] as const;

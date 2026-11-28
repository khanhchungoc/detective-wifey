/**
 * Single source of truth for button type on every pre-level screen (title, folder, file, briefing, intro).
 * Primary = font-sans semibold callout; secondary = font-sans medium subheadline. Callers add layout only.
 */
export const CTA_PRIMARY =
  'game-btn-primary touch-target-min min-h-[52px] inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-sans text-ios-callout font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-paper';

export const CTA_SECONDARY =
  'touch-target-min inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-game-dossier px-4 py-2 font-sans text-ios-subheadline font-medium text-game-text-secondary transition-colors hover:border-white/20 hover:text-game-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70';

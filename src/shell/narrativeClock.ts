/** Story start used only when the shell has no lockscreen config (Level 1 opening). */
export const FALLBACK_NARRATIVE_START_ISO = '2026-10-15T23:45:00';

const MINUTE_MS = 60_000;

function startMs(startIso: string): number {
  const parsed = new Date(startIso).getTime();
  return Number.isNaN(parsed) ? new Date(FALLBACK_NARRATIVE_START_ISO).getTime() : parsed;
}

/** Story time: the story start plus the real time elapsed since the phone mounted. */
export function narrativeNow(startIso: string, mountedAtMs: number, nowMs: number): Date {
  return new Date(startMs(startIso) + Math.max(0, nowMs - mountedAtMs));
}

/** Real milliseconds until the story clock shows the next minute. */
export function msUntilNextNarrativeMinute(startIso: string, mountedAtMs: number, nowMs: number): number {
  const story = narrativeNow(startIso, mountedAtMs, nowMs).getTime();
  return MINUTE_MS - (story % MINUTE_MS) || MINUTE_MS;
}

import { describe, expect, it } from 'vitest';
import { msUntilNextNarrativeMinute, narrativeNow } from './narrativeClock';

const START = '2026-10-15T23:45:00';
const hhmm = (date: Date) => date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

describe('narrative clock', () => {
  it('starts at the story time whatever the real clock says', () => {
    const date = narrativeNow(START, 5_000_000, 5_000_000);
    expect(hhmm(date)).toBe('23:45');
    expect(date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })).toBe('Thứ Năm, 15 tháng 10');
  });

  it('advances with real elapsed time and crosses midnight into the next day', () => {
    const date = narrativeNow(START, 0, 15 * 60_000);
    expect(hhmm(date)).toBe('00:00');
    expect(date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })).toBe('Thứ Sáu, 16 tháng 10');
  });

  it('never runs backwards and falls back on a bad start', () => {
    expect(hhmm(narrativeNow(START, 1_000, 0))).toBe('23:45');
    expect(hhmm(narrativeNow('not-a-date', 0, 0))).toBe('23:45');
  });

  it('waits only until the story minute changes', () => {
    expect(msUntilNextNarrativeMinute(START, 0, 0)).toBe(60_000);
    expect(msUntilNextNarrativeMinute(START, 0, 20_000)).toBe(40_000);
    expect(msUntilNextNarrativeMinute(START, 0, 60_000)).toBe(60_000);
  });
});

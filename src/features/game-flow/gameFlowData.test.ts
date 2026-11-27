import { describe, expect, it } from 'vitest';
import { loadCase } from '../case-runtime';
import { buildLockscreenConfig } from './gameFlowData';

describe('buildLockscreenConfig for Level 1', () => {
  it('shows two masked messaging notifications and the 8% charging battery', () => {
    const config = buildLockscreenConfig(loadCase('case_01'));
    expect(config.batteryPercent).toBe('8%');
    expect(config.narrativeTime).toBe('23:45');
    expect(config.notifications.map((n) => [n.appId, n.timeLabel])).toEqual([
      ['internet-messaging', '22:58'],
      ['internet-messaging', '23:41'],
    ]);
    // Masked bodies never reveal sender names or text.
    expect(config.notifications.every((n) => n.maskedBody === 'Bạn có 1 tin nhắn mới')).toBe(true);
    expect(config.passcode).toBeUndefined();
  });
});

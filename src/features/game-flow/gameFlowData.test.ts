import { describe, expect, it } from 'vitest';
import { getAvailableLevels, loadCase } from '../case-runtime';
import { buildCaseBriefing, buildHusbandProfiles, buildLevelCards, buildLockscreenConfig } from './gameFlowData';

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

describe('buildLockscreenConfig narrative clock', () => {
  it('derives the story start and short date label from one source', () => {
    const config = buildLockscreenConfig(loadCase('case_01'));
    expect(config.narrativeStartIso).toBe('2026-10-15T23:45:00');
    expect(config.narrativeDate).toBe('Th 5, 15 thg 10');
  });
});

describe('buildLevelCards', () => {
  it('puts a not-yet-playable Màn 0 guide file before the real cases', () => {
    const cards = buildLevelCards(getAvailableLevels('husband_hoang'), 1, {});
    expect(cards[0]).toMatchObject({ levelNumber: 0, isGuide: true, comingSoon: true });
    expect(cards.slice(1).map((c) => c.levelNumber)).toEqual([1, 2, 3]);
    expect(cards.filter((c) => c.levelNumber === 1)).toHaveLength(1);
  });
});

describe('buildCaseBriefing', () => {
  it('reads persona and wife profile from the husband profile SSOT', () => {
    const [hoang] = buildHusbandProfiles();
    const briefing = buildCaseBriefing(loadCase('case_01'), 'Điện thoại ngoài phòng tắm', hoang);
    expect(briefing.personaTraits).toBe(hoang.personaTraits);
    expect(briefing.wifeProfile).toBe(hoang.wifeProfile);
    expect(briefing.hookQuestion).toBe('Bạn có đủ tỉnh táo để tìm ra bằng chứng?');
    expect(briefing.introBeats.map((b) => b.speakerRole)).toEqual(['husband', 'wife']);
  });
});

describe('buildLevelCards summaries', () => {
  it('drops the difficulty prefix from case file summaries', () => {
    const cards = buildLevelCards(getAvailableLevels('husband_hoang'), 1, {});
    expect(cards.slice(1).every((c) => !c.summary.startsWith('Độ khó'))).toBe(true);
    expect(cards[1].summary.startsWith('23:45')).toBe(true);
  });
});

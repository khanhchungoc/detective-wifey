import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  LEVEL_CATALOG,
  getAvailableLevels,
  loadCase,
  loadCaseByLevel,
  mergeWithDefaultAppsData,
  validateCaseConfig,
} from './caseRuntime';
import { LevelSelectorSheet } from './components/LevelSelectorSheet';
import type { CaseConfig } from '../../shared/contracts/case-schema';

describe('caseRuntime', () => {
  it('returns ordered levels for a husband and empty list for unknown husband', () => {
    const levels = getAvailableLevels('husband_01');
    expect(levels.map((l) => l.levelNumber)).toEqual([0, 1, 2, 3]);
    expect(getAvailableLevels('unknown_husband')).toEqual([]);
  });

  it('loads valid bundled cases by id and by level number', () => {
    const byId = loadCase('case_01');
    const byLevel = loadCaseByLevel(1, 'husband_01');
    expect(byId.caseId).toBe('case_01');
    expect(byLevel.caseId).toBe('case_01');
    expect(byLevel.allowedStrikes).toBe(5);
  });

  it('describes Level 1 as the phone left outside the bathroom with an epilogue hook', () => {
    const level = LEVEL_CATALOG.find((l) => l.levelNumber === 1)!;
    expect(level.levelTitle).toBe('MÀN 1: Điện thoại ngoài phòng tắm');
    expect(level.storySnippet).toContain('23:45, chồng đang tắm, điện thoại 8% pin cắm sạc ngoài phòng.');
    const config = loadCase('case_01');
    expect(config.groundTruth.culpritSuspectId).toBe('suspect_01');
    expect(config.suspectPool.map((s) => s.suspectId)).toContain('suspect_02');
    expect(config.notifications?.map((n) => n.toastId)).toEqual(['toast_001', 'toast_002']);
    expect(config.epilogueNotification).toMatchObject({ sourceAppId: 'banking', senderTitle: 'Ngân hàng • Vừa xong' });
    expect(config.confrontationScript?.beats.map((b) => b.beatId)).toEqual([
      'beat_001', 'beat_002', 'beat_003',
    ]);
  });

  it('throws localized Vietnamese errors for missing caseId or out-of-range levelNumber', () => {
    expect(() => loadCase('nonexistent_case')).toThrow('Không thể tải dữ liệu vụ án');
    expect(() => loadCaseByLevel(-1)).toThrow('Không tìm thấy màn chơi yêu cầu.');
    expect(() => loadCaseByLevel(4)).toThrow('Không tìm thấy màn chơi yêu cầu.');
    expect(() => loadCaseByLevel(1, 'unknown_husband')).toThrow('Không tìm thấy màn chơi yêu cầu.');
  });

  it('rejects invalid CaseConfig payloads in validateCaseConfig', () => {
    const base = loadCase('case_01');

    expect(validateCaseConfig(null as unknown as CaseConfig).isValid).toBe(false);
    expect(validateCaseConfig({ ...base, caseId: '   ' }).isValid).toBe(false);
    expect(validateCaseConfig({ ...base, levelNumber: 9 as 1 }).isValid).toBe(false);
    expect(validateCaseConfig({ ...base, allowedStrikes: 2 }).isValid).toBe(false);
    expect(validateCaseConfig({ ...base, suspectPool: [] }).isValid).toBe(false);
    expect(
      validateCaseConfig({
        ...base,
        groundTruth: { ...base.groundTruth, culpritSuspectId: 'ghost_suspect' },
      }).isValid,
    ).toBe(false);
  });

  it('keeps ecommerce isolated from default filler while merging other apps', () => {
    const mergedWithoutEcommerce = mergeWithDefaultAppsData({});
    expect(mergedWithoutEcommerce.ecommerce).toBeUndefined();

    const customOrders = { orders: [{ id: 'ord_1' }] };
    const mergedWithEcommerce = mergeWithDefaultAppsData({ ecommerce: customOrders });
    expect(mergedWithEcommerce.ecommerce).toEqual(customOrders);
  });
});

describe('LevelSelectorSheet', () => {
  it('renders active badge for current level and locked state for levels above unlockedMaxLevel', () => {
    const html = renderToStaticMarkup(
      <LevelSelectorSheet
        levels={LEVEL_CATALOG}
        activeLevelNumber={1}
        unlockedMaxLevel={1}
        starRatings={{ case_01: 3 }}
        onSelectLevel={() => {}}
        onClose={() => {}}
      />,
    );

    expect(html).toContain('HỒ SƠ VỤ ÁN &amp; CHỌN MÀN CHƠI');
    expect(html).toContain('Đang chơi');
    expect(html).toContain('Tiếp tục điều tra');
    expect(html).toContain('KHÓA');
    expect(html).toContain('Mở sau Màn 1');
    expect(html).toContain('Mở sau Màn 2');
  });
});

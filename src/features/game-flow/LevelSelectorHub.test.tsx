import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { HusbandProfile, LevelCardItem } from '../../shared/contracts/game-flow';
import {
  FLICK_VELOCITY_PX_S,
  LOCKED_LEVEL_FEEDBACK,
  LevelSelectorHub,
  SELECT_DEBOUNCE_MS,
  applyRubberBand,
  canStartLevel,
  clampPageIndex,
  evaluateLevelCardClick,
  resolveDefaultLevelIndex,
  resolveInitialHusbandIndex,
  resolvePagerTarget,
} from './LevelSelectorHub';
import { LevelStage } from './case-files/LevelStage';

const RAW_EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const EM_DASH_REGEX = /[—–]/;
const ARBITRARY_TEXT_PX_REGEX = /text-\[\d+px\]/;

const HUSBANDS: HusbandProfile[] = [
  {
    husbandId: 'hoang',
    caseCode: 'HỒ SƠ #01',
    displayName: 'Nguyễn Huy Hoàng',
    age: 29,
    occupation: 'Tech Lead · Technosoft (Hà Nội)',
    teaserQuote: 'Anh chỉ đi họp với đối tác thôi mà em.',
    personaTraits: ['Hay úp màn hình, mang máy vào nhà tắm'],
    wifeProfile: {
      displayName: 'Lê Minh Thư',
      age: 28,
      occupation: 'Kế toán trưởng',
      portraitUrl: '/assets/avatars/minhthu.png',
      anchors: ['Áo/váy size M'],
    },
    portraitUrl: '/assets/avatars/hoang.png',
  },
  {
    husbandId: 'tuan',
    caseCode: 'HỒ SƠ #02',
    displayName: 'Trần Quốc Tuấn',
    age: 38,
    occupation: 'Kiến trúc sư trưởng',
    teaserQuote: 'Công trình ở xa, cuối tuần anh mới về.',
    portraitUrl: '/assets/avatars/tuan.png',
    comingSoon: true,
  },
];

const LEVELS: LevelCardItem[] = [
  {
    caseId: 'hoang_00',
    husbandId: 'hoang',
    levelNumber: 0,
    levelTitle: 'Hướng dẫn điều tra',
    summary: 'Lần đầu soi điện thoại chồng? Học nghề ở đây trước.',
    activeAppCount: 0,
    allowedStrikes: 0,
    isGuide: true,
    comingSoon: true,
    unlocked: true,
  },
  {
    caseId: 'hoang_01',
    husbandId: 'hoang',
    levelNumber: 1,
    levelTitle: 'Bữa trưa bí ẩn',
    summary: 'Hóa đơn cơm niêu và tin nhắn lạ lúc nửa đêm.',
    activeAppCount: 6,
    allowedStrikes: 3,
    unlocked: true,
    bestStars: 2,
  },
  {
    caseId: 'hoang_02',
    husbandId: 'hoang',
    levelNumber: 2,
    levelTitle: 'Chuyến công tác Đà Nẵng',
    summary: 'Vé máy bay khứ hồi và mã khóa điện thoại mới.',
    activeAppCount: 8,
    allowedStrikes: 2,
    unlocked: false,
    lockHint: 'Hoàn thành Màn 1',
  },
];

const renderHub = (initialHusbandId = 'hoang') =>
  renderToStaticMarkup(
    <LevelSelectorHub
      husbands={HUSBANDS}
      levels={LEVELS}
      initialHusbandId={initialHusbandId}
      isMuted={false}
      onToggleMute={vi.fn()}
      onSelectLevel={vi.fn()}
    />,
  );

const renderLevelStage = (initialIndex?: number) =>
  renderToStaticMarkup(
    <LevelStage
      husband={HUSBANDS[0]}
      levels={LEVELS}
      reduced={false}
      onBack={vi.fn()}
      onSelectLevel={vi.fn()}
      initialIndex={initialIndex}
    />,
  );

describe('LevelSelectorHub husband stage', () => {
  it('opens on the husband stage with the case file header and one primary CTA', () => {
    const html = renderHub();
    expect(html).toContain('data-selector-stage="husbands"');
    expect(html).toContain('Hồ sơ vụ án');
    expect(html).not.toContain('Chọn màn');
    expect(html).toContain('aria-label="Tắt âm thanh"');
    expect(html).toContain('>Mở hồ sơ<');
    expect(html).not.toContain('>Đổi hồ sơ<');
    expect(html).toContain('data-husband-id="hoang"');
    expect(html).not.toContain('data-husband-id="tuan"');
    expect(html).toContain('HỒ SƠ #01');
    expect(html).toContain('Đang theo dõi');
    expect(html).toContain('Nguyễn Huy Hoàng');
    expect(html).toContain('/assets/avatars/hoang.png');
    expect(html).toContain('aria-label="Chồng trước"');
    expect(html).toContain('aria-label="Chồng tiếp theo"');
  });

  it('keeps swipe-friendly touch action and no mono, emoji, em dash or arbitrary text sizes', () => {
    const html = renderHub();
    expect(html).toContain('touch-action:pan-y');
    expect(html).not.toContain('font-mono');
    expect(html).not.toMatch(ARBITRARY_TEXT_PX_REGEX);
    expect(html).not.toMatch(RAW_EMOJI_REGEX);
    expect(html).not.toMatch(EM_DASH_REGEX);
  });

  it('removes persona notes and wife profile from the selector', () => {
    const html = renderHub();
    expect(html).not.toContain('Hồ sơ tính cách');
    expect(html).not.toContain('Hồ sơ người vợ');
    expect(html).not.toContain('data-husband-persona');
    expect(html).not.toContain('data-wife-profile');
    expect(html).not.toContain('Lê Minh Thư');
    expect(html).not.toContain('Hay úp màn hình');
  });

  it('renders the coming-soon husband redacted, never with a portrait, and cannot open it', () => {
    const html = renderHub('tuan');
    expect(html).toContain('data-husband-id="tuan"');
    expect(html).not.toContain('/assets/avatars/tuan.png');
    expect(html).toContain('Sắp ra mắt');
    expect(html).toContain('data-coming-soon-stamp="true"');
    expect(html).toContain('Thông tin đang bị che');
    expect(html).not.toContain('Kiến trúc sư trưởng');
    expect(html).not.toContain('Công trình ở xa');
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Mở hồ sơ<\/button>/);
  });

  it('enables the open button for a released husband', () => {
    expect(renderHub()).not.toMatch(/<button[^>]*disabled=""[^>]*>Mở hồ sơ<\/button>/);
  });
});

describe('LevelStage (folder opened)', () => {
  it('shows a jump tab per file and the back button', () => {
    const html = renderLevelStage();
    for (const id of ['hoang_00', 'hoang_01', 'hoang_02']) {
      expect(html).toContain(`data-level-tab="${id}"`);
    }
    expect(html).toContain('Đổi hồ sơ');
  });

  it('opens on the highest unlocked non-guide case with a single start button', () => {
    const html = renderLevelStage();
    expect(html.match(/data-case-id="/g)).toHaveLength(1);
    expect(html).toContain('data-case-id="hoang_01"');
    expect(html).toContain('>Điều tra màn này<');
    expect(html).toContain('Bữa trưa bí ẩn');
    expect(html).toContain('aria-label="Đạt 2 trên 3 sao"');
  });

  it('renders the locked file with a stamp and hint but no start button', () => {
    const html = renderLevelStage(2);
    expect(html).toContain('Khóa');
    expect(html).toContain('Hoàn thành Màn 1');
    expect(html).toContain('data-level-unlocked="false"');
    expect(html).not.toContain('data-case-id="hoang_02"');
    expect(html).not.toContain('>Điều tra màn này<');
  });

  it('renders the guide file as a distinct teaser with no start button', () => {
    const html = renderLevelStage(0);
    expect(html).toContain('data-level-guide="true"');
    expect(html).toContain('Hướng dẫn');
    expect(html).toContain('Học nghề ở đây trước');
    expect(html).toContain('Sắp có');
    expect(html).toContain('bg-game-paper-slip');
    expect(html).not.toContain('>Điều tra màn này<');
    expect(html).not.toContain('data-case-id=');
  });

  it('has no em dash, emoji or arbitrary text sizes', () => {
    const html = renderLevelStage();
    expect(html).not.toMatch(EM_DASH_REGEX);
    expect(html).not.toMatch(RAW_EMOJI_REGEX);
    expect(html).not.toMatch(ARBITRARY_TEXT_PX_REGEX);
    expect(html).not.toContain('font-mono');
  });
});

describe('case file helpers', () => {
  it('resolves the initial husband and clamps page indexes', () => {
    expect(resolveInitialHusbandIndex(HUSBANDS, 'tuan')).toBe(1);
    expect(resolveInitialHusbandIndex(HUSBANDS, 'unknown')).toBe(0);
    expect(resolveInitialHusbandIndex([], 'x')).toBe(0);
    expect(clampPageIndex(5, 2)).toBe(1);
    expect(clampPageIndex(-1, 2)).toBe(0);
    expect(clampPageIndex(1, 0)).toBe(0);
  });

  it('picks the highest unlocked non-guide case as default file', () => {
    expect(resolveDefaultLevelIndex(LEVELS)).toBe(1);
    const allUnlocked = LEVELS.map((l) => ({ ...l, unlocked: true }));
    expect(resolveDefaultLevelIndex(allUnlocked)).toBe(2);
    const onlyGuide = [LEVELS[0]];
    expect(resolveDefaultLevelIndex(onlyGuide)).toBe(0);
    const lockedOnly = [LEVELS[0], { ...LEVELS[1], unlocked: false }];
    expect(resolveDefaultLevelIndex(lockedOnly)).toBe(1);
  });

  it('resolves swipe release: distance, flick, edges and tiny movement', () => {
    const base = { baseIndex: 0, stridePx: 200, total: 3 };
    // Drag left past 20% of a page goes to the next page
    expect(resolvePagerTarget({ ...base, dx: -50, velocityX: 0 })).toBe(1);
    // Drag right goes back, but never below the first page
    expect(resolvePagerTarget({ ...base, dx: 80, velocityX: 0 })).toBe(0);
    expect(resolvePagerTarget({ ...base, baseIndex: 1, dx: 80, velocityX: 0 })).toBe(0);
    // Short drag stays
    expect(resolvePagerTarget({ ...base, dx: -20, velocityX: 0 })).toBe(0);
    // Short but fast flick turns the page
    expect(resolvePagerTarget({ ...base, dx: -20, velocityX: -FLICK_VELOCITY_PX_S })).toBe(1);
    // Never past the last page, never more than one page per gesture
    expect(resolvePagerTarget({ ...base, baseIndex: 2, dx: -400, velocityX: -2000 })).toBe(2);
    expect(resolvePagerTarget({ ...base, dx: -900, velocityX: -2000 })).toBe(1);
    // Unmeasured surface keeps the page
    expect(resolvePagerTarget({ ...base, stridePx: 0, dx: -300, velocityX: 0 })).toBe(0);
  });

  it('applies rubber band resistance only outside the page range', () => {
    expect(applyRubberBand(0.5, 3)).toBe(0.5);
    expect(applyRubberBand(-1, 3)).toBeCloseTo(-0.35);
    expect(applyRubberBand(3, 3)).toBeCloseTo(2.35);
  });

  it('guards starting levels: guide, locked, coming-soon husband and rapid taps', () => {
    expect(canStartLevel(LEVELS[0])).toBe(false);
    expect(canStartLevel(LEVELS[1])).toBe(true);
    expect(canStartLevel(LEVELS[2])).toBe(false);

    expect(evaluateLevelCardClick(LEVELS[0], false, 0, 1000)).toEqual({ action: 'ignore', feedback: null });
    expect(evaluateLevelCardClick(LEVELS[2], false, 0, 1000)).toEqual({
      action: 'locked',
      feedback: LOCKED_LEVEL_FEEDBACK,
    });
    expect(LOCKED_LEVEL_FEEDBACK).toBe('Bạn cần vượt qua màn chơi trước để mở khóa màn này');
    expect(evaluateLevelCardClick(LEVELS[1], false, 0, 1000)).toEqual({ action: 'select', feedback: null });
    expect(evaluateLevelCardClick(LEVELS[1], false, 1000, 1000 + SELECT_DEBOUNCE_MS - 50)).toEqual({
      action: 'ignore',
      feedback: null,
    });
    expect(evaluateLevelCardClick(LEVELS[1], false, 1000, 1000 + SELECT_DEBOUNCE_MS)).toEqual({
      action: 'select',
      feedback: null,
    });
    expect(evaluateLevelCardClick(LEVELS[1], true, 0, 5000)).toEqual({ action: 'ignore', feedback: null });
  });
});

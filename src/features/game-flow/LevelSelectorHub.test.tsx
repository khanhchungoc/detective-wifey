import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type {
  HusbandProfile,
  LevelCardItem,
} from '../../shared/contracts/game-flow';
import {
  LOCKED_LEVEL_FEEDBACK,
  LevelSelectorHub,
  SELECT_DEBOUNCE_MS,
  SWIPE_THRESHOLD_PX,
  evaluateLevelCardClick,
  formatLevel0StatusLabel,
  resolveHorizontalSwipeDelta,
  resolveInitialHusbandIndex,
  stepCarouselIndex,
} from './LevelSelectorHub';

const RAW_EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const EM_DASH_REGEX = /[\u2014\u2013]/;
const ARBITRARY_TEXT_PX_REGEX = /text-\[\d+px\]/;

const HUSBANDS: HusbandProfile[] = [
  {
    husbandId: 'hoang',
    caseCode: 'HỒ SƠ #01',
    displayName: 'Nguyễn Huy Hoàng',
    fullName: 'Nguyễn Huy Hoàng',
    age: 29,
    occupation: 'Tech Lead · Technosoft (Hà Nội)',
    teaserQuote: 'Anh chỉ đi họp với đối tác thôi mà em.',
    personaTraits: [
      'Tự nhận sợ vợ số 1, nộp 90% lương',
      'Hay úp màn hình, mang máy vào nhà tắm',
      'Cửa miệng: "OT fix bug cho kịp sprint"',
    ],
    wifeAnchor: 'Vợ Minh Thư (28t): Áo/váy size M · Giày 37 · CT2 An Bình',
    wifeProfile: {
      displayName: 'Lê Minh Thư',
      age: 28,
      occupation: 'Kế toán trưởng',
      portraitUrl: '/assets/avatars/minhthu.png',
      anchors: [
        'Áo/váy size M',
        'Giày size 37',
        'Chung cư CT2 An Bình City, Bắc Từ Liêm',
      ],
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
    personaTraits: ['Đang cập nhật hồ sơ điều tra'],
    portraitUrl: '/assets/avatars/tuan.png',
    comingSoon: true,
  },
];

const LEVELS: LevelCardItem[] = [
  {
    caseId: 'hoang_00',
    husbandId: 'hoang',
    levelNumber: 0,
    levelTitle: 'Tập điều tra',
    summary: 'Học cách soi bằng chứng và gắn thẻ nghi phạm.',
    activeAppCount: 2,
    allowedStrikes: 3,
    isPractice: true,
    unlocked: true,
    recommended: true,
    level0Status: 'not_started',
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

describe('LevelSelectorHub (US-036)', () => {
  describe('Responsive Layout, Husband Case File Folder & Separate Wife Profile', () => {
    it('renders responsive 12-column workspace, bigger husband dossier folder with stamp/paperclip, and structured dossier fields', () => {
      const html = renderToStaticMarkup(
        <LevelSelectorHub
          husbands={HUSBANDS}
          levels={LEVELS}
          initialHusbandId="hoang"
          isMuted={false}
          onToggleMute={vi.fn()}
          onSelectLevel={vi.fn()}
        />,
      );

      // Responsive flat darkroom workspace
      expect(html).toContain('max-w-4xl');
      expect(html).toContain('lg:grid-cols-12');
      expect(html).toContain('lg:col-span-7');
      expect(html).toContain('lg:col-span-5');
      expect(html).not.toContain('max-w-[480px]');

      // Header & controls
      expect(html).toContain('Chọn màn');
      expect(html).not.toContain('Hồ sơ điều tra');
      expect(html).not.toContain('Danh sách vụ án');
      expect(html).toContain('aria-label="Tắt âm thanh"');
      expect(html).toContain('aria-label="Chồng trước"');
      expect(html).toContain('aria-label="Chồng tiếp theo"');

      // Flat husband switcher + levels above fold + reference traits
      expect(html).toContain('data-case-folder-tab="true"');
      expect(html).toContain('Hồ sơ #01');
      expect(html).toContain('Đang theo dõi');
      expect(html).toContain('Hồ sơ tính cách');
      expect(html).toContain('Nguyễn Huy Hoàng');
      expect(html).toContain('29 tuổi');
      expect(html).toContain('Tech Lead · Technosoft (Hà Nội)');
      expect(html).toContain('Tự nhận sợ vợ số 1, nộp 90% lương');
      expect(html).toContain('Hay úp màn hình, mang máy vào nhà tắm');
      expect(html).not.toContain('Anh chỉ đi họp với đối tác thôi mà em.');
      // Levels appear before secondary reference notes in DOM order
      expect(html.indexOf('data-case-id="hoang_01"')).toBeLessThan(html.indexOf('data-husband-persona="true"'));

      // Accessibility & design guardrails
      expect(html).toContain('touch-action:pan-y');
      expect(html).toContain('role="tablist"');
      expect(html).not.toContain('font-mono');
      expect(RAW_EMOJI_REGEX.test(html)).toBe(false);
      expect(EM_DASH_REGEX.test(html)).toBe(false);
      expect(ARBITRARY_TEXT_PX_REGEX.test(html)).toBe(false);
    });

    it('renders separate Wife Profile section with wife portrait image and forensic anchors when husband.wifeProfile is present', () => {
      const html = renderToStaticMarkup(
        <LevelSelectorHub
          husbands={HUSBANDS}
          levels={LEVELS}
          initialHusbandId="hoang"
          onSelectLevel={vi.fn()}
        />,
      );

      expect(html).toContain('data-wife-profile="true"');
      expect(html).toContain('Hồ sơ người vợ');
      expect(html).toContain('src="/assets/avatars/minhthu.png"');
      expect(html).toContain('alt="Lê Minh Thư"');
      expect(html).toContain('Lê Minh Thư');
      expect(html).toContain('28 tuổi · Kế toán trưởng');
      expect(html).toContain('data-wife-anchors="true"');
      expect(html).toContain('Áo/váy size M');
      expect(html).toContain('Giày size 37');
      expect(html).toContain('Chung cư CT2 An Bình City, Bắc Từ Liêm');
    });

    it('renders coming-soon status, omits wife profile section, and hides level rows when husband.comingSoon is true', () => {
      const html = renderToStaticMarkup(
        <LevelSelectorHub
          husbands={HUSBANDS}
          levels={LEVELS}
          initialHusbandId="tuan"
          onSelectLevel={vi.fn()}
        />,
      );

      expect(html).toContain('Hồ sơ #02');
      expect(html).toContain('Trần Quốc Tuấn');
      expect(html).toContain('38 tuổi');
      expect(html).toContain('data-coming-soon-stamp="true"');
      expect(html).toContain('Sắp ra mắt');
      expect(html).not.toContain('data-wife-profile="true"');
      expect(html).not.toContain('Bữa trưa bí ẩn');
    });

    it('navigates carousel via button steps and horizontal pointer swipe threshold (>= 44px)', () => {
      expect(resolveInitialHusbandIndex(HUSBANDS, 'tuan')).toBe(1);
      expect(resolveInitialHusbandIndex(HUSBANDS, 'unknown')).toBe(0);

      // Button navigation wraps cleanly
      expect(stepCarouselIndex(0, 1, HUSBANDS.length)).toBe(1);
      expect(stepCarouselIndex(1, 1, HUSBANDS.length)).toBe(0);
      expect(stepCarouselIndex(0, -1, HUSBANDS.length)).toBe(1);

      // Swipe left (dx <= -44) advances to next husband (+1)
      expect(resolveHorizontalSwipeDelta(200, 100, 200 - SWIPE_THRESHOLD_PX, 105)).toBe(1);
      // Swipe right (dx >= 44) goes to previous husband (-1)
      expect(resolveHorizontalSwipeDelta(100, 100, 100 + SWIPE_THRESHOLD_PX, 110)).toBe(-1);
      // Below threshold or mostly vertical does not swipe
      expect(resolveHorizontalSwipeDelta(100, 100, 130, 100)).toBe(0);
      expect(resolveHorizontalSwipeDelta(100, 100, 150, 200)).toBe(0);
    });
  });

  describe('Level 0 Practice Badges & Status Mapping', () => {
    it('renders yellow sticky-note recommended badge and compact status without filler summary', () => {
      expect(formatLevel0StatusLabel('not_started')).toBe('Chưa học');
      expect(formatLevel0StatusLabel('skipped')).toBe('Đã bỏ qua');
      expect(formatLevel0StatusLabel('completed')).toBe('Đã hoàn thành');

      const html = renderToStaticMarkup(
        <LevelSelectorHub
          husbands={HUSBANDS}
          levels={LEVELS}
          initialHusbandId="hoang"
          onSelectLevel={vi.fn()}
        />,
      );

      expect(html).toContain('Màn 0 · Tập điều tra');
      expect(html).toContain('data-recommended-badge="true"');
      expect(html).toContain('bg-game-sticky');
      expect(html).toContain('Đề xuất');
      expect(html).toContain('Chưa học');
      expect(html).not.toContain('Học cách soi bằng chứng');

      const completedLevels = LEVELS.map((lvl) =>
        lvl.caseId === 'hoang_00'
          ? { ...lvl, recommended: false, level0Status: 'completed' as const }
          : lvl,
      );
      const completedHtml = renderToStaticMarkup(
        <LevelSelectorHub
          husbands={HUSBANDS}
          levels={completedLevels}
          initialHusbandId="hoang"
          onSelectLevel={vi.fn()}
        />,
      );
      expect(completedHtml).not.toContain('data-recommended-badge="true"');
      expect(completedHtml).toContain('Đã hoàn thành');
    });
  });

  describe('Unlocked & Locked Level Cards and Selection Guard', () => {
    it('renders compact unlocked level rows with star rating and no filler metadata', () => {
      const html = renderToStaticMarkup(
        <LevelSelectorHub
          husbands={HUSBANDS}
          levels={LEVELS}
          initialHusbandId="hoang"
          onSelectLevel={vi.fn()}
        />,
      );

      expect(html).toContain('border-l-game-crimson');
      expect(html).toContain('Màn 1 · Bữa trưa bí ẩn');
      expect(html).toContain('aria-label="Đạt 2 trên 3 sao"');
      expect(html).not.toContain('Hóa đơn cơm niêu');
      expect(html).not.toContain('ứng dụng');
      expect(html).not.toContain('Chơi ngay');
    });

    it('renders locked level rows with short hint and blocks launch with inline alert message', () => {
      const html = renderToStaticMarkup(
        <LevelSelectorHub
          husbands={HUSBANDS}
          levels={LEVELS}
          initialHusbandId="hoang"
          onSelectLevel={vi.fn()}
        />,
      );

      expect(html).toContain('data-case-id="hoang_02"');
      expect(html).toContain('data-level-unlocked="false"');
      expect(html).toContain('Màn 2 · Chuyến công tác Đà Nẵng');
      expect(html).toContain('Hoàn thành Màn 1');

      const lockedResult = evaluateLevelCardClick(LEVELS[2], false, 0, 1000);
      expect(lockedResult).toEqual({
        action: 'locked',
        feedback: LOCKED_LEVEL_FEEDBACK,
      });
      expect(LOCKED_LEVEL_FEEDBACK).toBe(
        'Bạn cần vượt qua màn chơi trước để mở khóa màn này',
      );
    });

    it('allows unlocked level selection and debounces rapid double-taps', () => {
      const firstTap = evaluateLevelCardClick(LEVELS[1], false, 0, 1000);
      expect(firstTap).toEqual({ action: 'select', feedback: null });

      const rapidSecondTap = evaluateLevelCardClick(
        LEVELS[1],
        false,
        1000,
        1000 + SELECT_DEBOUNCE_MS - 50,
      );
      expect(rapidSecondTap).toEqual({ action: 'ignore', feedback: null });

      const afterCooldown = evaluateLevelCardClick(
        LEVELS[1],
        false,
        1000,
        1000 + SELECT_DEBOUNCE_MS,
      );
      expect(afterCooldown).toEqual({ action: 'select', feedback: null });

      // Coming-soon husband ignores all taps
      const comingSoonTap = evaluateLevelCardClick(LEVELS[1], true, 0, 5000);
      expect(comingSoonTap).toEqual({ action: 'ignore', feedback: null });
    });
  });
});

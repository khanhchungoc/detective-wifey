import React, { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { CaseBriefingData } from '../../shared/contracts/game-flow';
import {
  createInitialBriefingState,
  LevelContextBriefing,
  LevelContextBriefingSurface,
  reduceBriefingFlowState,
} from './LevelContextBriefing';

const RAW_EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const EM_DASH_REGEX = /[\u2014\u2013]/;
const ARBITRARY_TEXT_PX_REGEX = /text-\[\d+px\]/;

const SAMPLE_BRIEFING: CaseBriefingData = {
  caseId: 'case_01',
  levelNumber: 1,
  levelTitle: 'Mùi nước hoa lạ sau chuyến công tác',
  husbandId: 'husband_hoang',
  husbandName: 'Chồng Hoàng',
  husbandFullName: 'Nguyễn Huy Hoàng',
  husbandAge: 29,
  husbandOccupation: 'Tech Lead · Technosoft (Hà Nội)',
  husbandPortraitUrl: '/assets/portraits/hoang.png',
  personaTraits: [
    'Tự nhận sợ vợ số 1, nộp 90% lương tháng',
    'Hay úp màn hình điện thoại xuống bàn',
    'Cửa miệng: "Anh đang OT fix bug giỏ hàng"',
  ],
  wifeAnchor: 'Vợ Minh Thư: size M · giày 37 · chung cư An Bình',
  wifeProfile: {
    displayName: 'Minh Thư',
    age: 27,
    occupation: 'Kế toán trưởng',
    portraitUrl: '/assets/portraits/minh-thu.png',
    anchors: ['Size M', 'Giày 37', 'Chung cư An Bình'],
  },
  statedAlibi: 'Anh phải họp gấp với đối tác ở Đà Nẵng, điện thoại hết pin nên không nghe máy.',
  suspicionHook: 'Áo sơ mi có vết son lạ và hóa đơn thanh toán lại xuất hiện ngay tại trung tâm thành phố.',
  activeAppCount: 4,
  allowedStrikes: 5,
  lockModeLabel: 'Mở khóa FaceID',
  introBeats: [
    {
      beatId: 'beat_1',
      speaker: 'Minh Hoàng',
      locationTime: 'Phòng khách - 23:15',
      mood: 'confident',
      line: 'Anh về rồi đây, nay tăng ca mệt quá. Để anh đi tắm một chút nhé.',
    },
    {
      beatId: 'beat_2',
      speaker: 'Vợ (Suy nghĩ)',
      locationTime: 'Phòng khách - 23:17',
      mood: 'nervous',
      line: 'Điện thoại anh ấy để úp trên bàn nhưng vừa sáng màn hình liên tục. Phải kiểm tra ngay.',
    },
  ],
};

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (isValidElement<{ children?: React.ReactNode }>(node)) {
    return extractText(node.props.children);
  }
  return '';
}

function isButtonElement(el: React.ReactElement<Record<string, unknown>>): boolean {
  return el.type === 'button' || el.props.type === 'button';
}

function findElements(
  node: unknown,
  predicate: (el: React.ReactElement<Record<string, unknown>>) => boolean,
): React.ReactElement<Record<string, unknown>>[] {
  const results: React.ReactElement<Record<string, unknown>>[] = [];
  if (Array.isArray(node)) {
    for (const child of node) {
      results.push(...findElements(child, predicate));
    }
    return results;
  }
  if (!isValidElement<Record<string, unknown>>(node)) {
    return results;
  }
  if (predicate(node)) {
    results.push(node);
  }
  if (node.props.children) {
    results.push(...findElements(node.props.children as React.ReactNode, predicate));
  }
  return results;
}

describe('LevelContextBriefing (US-037)', () => {
  it('starts in Sub-State 3A intro dialogue with full-viewport stage, commanding portrait, and steps through beats to Sub-State 3B', () => {
    let state = createInitialBriefingState('entry', SAMPLE_BRIEFING.introBeats.length);
    expect(state).toEqual({ phase: 'intro', beatIndex: 0 });

    // Beat 1 rendered output
    const initialHtml = renderToStaticMarkup(
      <LevelContextBriefing briefing={SAMPLE_BRIEFING} mode="entry" />,
    );
    expect(initialHtml).toContain('data-briefing-phase="intro"');
    expect(initialHtml).toContain('h-[100dvh]');
    expect(initialHtml).toContain('max-w-4xl');
    expect(initialHtml).toContain('data-intro-backdrop="true"');
    expect(initialHtml).toContain('opacity-35');
    expect(initialHtml).toContain('blur-[2px]');
    expect(initialHtml).toContain('w-64');
    expect(initialHtml).toContain('h-80');
    expect(initialHtml).toContain('md:w-80');
    expect(initialHtml).toContain('md:h-[420px]');
    expect(initialHtml).toContain('bg-game-backdrop');
    expect(initialHtml).toContain('bg-game-dossier');
    expect(initialHtml).toContain('aria-label="Chọn màn"');
    expect(initialHtml).toContain('Bỏ qua');
    expect(initialHtml).toContain(SAMPLE_BRIEFING.husbandPortraitUrl);
    expect(initialHtml).toContain('Nguyễn Huy Hoàng');
    expect(initialHtml).toContain('Tech Lead · Technosoft (Hà Nội)');
    expect(initialHtml).toContain('Minh Hoàng');
    expect(initialHtml).not.toContain('Phòng khách - 23:15');
    expect(initialHtml).toContain(SAMPLE_BRIEFING.introBeats[0].line);
    expect(initialHtml).toContain('data-beat-progress="1/2"');
    expect(initialHtml).toContain('data-beat-indicator="active"');
    expect(initialHtml).toContain('data-intro-prev-button="true"');
    expect(initialHtml).toContain('Trước');
    expect(initialHtml).toContain('Tiếp');
    expect(RAW_EMOJI_REGEX.test(initialHtml)).toBe(false);
    expect(EM_DASH_REGEX.test(initialHtml)).toBe(false);
    expect(initialHtml).not.toContain('font-mono');
    expect(ARBITRARY_TEXT_PX_REGEX.test(initialHtml)).toBe(false);

    // Click Next button to advance from Beat 1 to Beat 2
    const beat1Tree = LevelContextBriefingSurface({
      briefing: SAMPLE_BRIEFING,
      mode: 'entry',
      flowState: state,
      onAdvanceBeat: () => {
        state = reduceBriefingFlowState(state, {
          type: 'advance',
          totalBeats: SAMPLE_BRIEFING.introBeats.length,
        });
      },
      onPrevBeat: vi.fn(),
      onSkipIntro: vi.fn(),
    });
    const advanceButtons1 = findElements(
      beat1Tree,
      el => isButtonElement(el) && el.props['data-intro-advance-card'] === 'true',
    );
    expect(advanceButtons1).toHaveLength(1);
    expect(String(advanceButtons1[0].props.className)).toContain('touch-target-min');
    (advanceButtons1[0].props.onClick as () => void)();
    expect(state).toEqual({ phase: 'intro', beatIndex: 1 });

    // Render Beat 2 and verify beat progress, dialogue, and last-beat CTA label
    const beat2Html = renderToStaticMarkup(
      <LevelContextBriefingSurface
        briefing={SAMPLE_BRIEFING}
        mode="entry"
        flowState={state}
        onAdvanceBeat={vi.fn()}
        onPrevBeat={vi.fn()}
        onSkipIntro={vi.fn()}
      />,
    );
    expect(beat2Html).toContain('data-beat-progress="2/2"');
    expect(beat2Html).toContain('data-beat-indicator="past"');
    expect(beat2Html).toContain(SAMPLE_BRIEFING.introBeats[1].line);
    expect(beat2Html).toContain('Xem hồ sơ');

    // Click Next button on last beat to transition to Sub-State 3B
    const beat2Tree = LevelContextBriefingSurface({
      briefing: SAMPLE_BRIEFING,
      mode: 'entry',
      flowState: state,
      onAdvanceBeat: () => {
        state = reduceBriefingFlowState(state, {
          type: 'advance',
          totalBeats: SAMPLE_BRIEFING.introBeats.length,
        });
      },
      onPrevBeat: vi.fn(),
      onSkipIntro: vi.fn(),
    });
    const advanceButtons2 = findElements(
      beat2Tree,
      el => isButtonElement(el) && el.props['data-intro-advance-card'] === 'true',
    );
    (advanceButtons2[0].props.onClick as () => void)();
    expect(state.phase).toBe('briefing');
  });

  it('supports going back to previous dialogue via reduceBriefingFlowState prev action and the "Trước" button', () => {
    // Reducer clamps at beatIndex 0
    expect(reduceBriefingFlowState({ phase: 'intro', beatIndex: 0 }, { type: 'prev' })).toEqual({
      phase: 'intro',
      beatIndex: 0,
    });
    expect(reduceBriefingFlowState({ phase: 'intro', beatIndex: 2 }, { type: 'prev' })).toEqual({
      phase: 'intro',
      beatIndex: 1,
    });
    expect(reduceBriefingFlowState({ phase: 'briefing', beatIndex: 1 }, { type: 'prev' })).toEqual({
      phase: 'briefing',
      beatIndex: 1,
    });

    // On beat 0, "Trước" button is disabled and does not call onPrevBeat
    const onPrevAtStart = vi.fn();
    const beat0Tree = LevelContextBriefingSurface({
      briefing: SAMPLE_BRIEFING,
      mode: 'entry',
      flowState: { phase: 'intro', beatIndex: 0 },
      onAdvanceBeat: vi.fn(),
      onPrevBeat: onPrevAtStart,
      onSkipIntro: vi.fn(),
    });
    const prevButtons0 = findElements(
      beat0Tree,
      el => isButtonElement(el) && el.props['data-intro-prev-button'] === 'true',
    );
    expect(prevButtons0).toHaveLength(1);
    expect(prevButtons0[0].props.disabled).toBe(true);
    expect(String(prevButtons0[0].props.className)).toContain('touch-target-min');
    const stopPropagation0 = vi.fn();
    (prevButtons0[0].props.onClick as (e: { stopPropagation: () => void }) => void)({
      stopPropagation: stopPropagation0,
    });
    expect(stopPropagation0).toHaveBeenCalledTimes(1);
    expect(onPrevAtStart).not.toHaveBeenCalled();

    // On beat 1, "Trước" button is enabled and steps back to beat 0
    let state = { phase: 'intro' as const, beatIndex: 1 };
    const beat1Tree = LevelContextBriefingSurface({
      briefing: SAMPLE_BRIEFING,
      mode: 'entry',
      flowState: state,
      onAdvanceBeat: vi.fn(),
      onPrevBeat: () => {
        state = reduceBriefingFlowState(state, { type: 'prev' }) as {
          phase: 'intro';
          beatIndex: number;
        };
      },
      onSkipIntro: vi.fn(),
    });
    const prevButtons1 = findElements(
      beat1Tree,
      el => isButtonElement(el) && el.props['data-intro-prev-button'] === 'true',
    );
    expect(prevButtons1).toHaveLength(1);
    expect(prevButtons1[0].props.disabled).toBe(false);
    expect(extractText(prevButtons1[0].props.children as React.ReactNode)).toContain('Trước');
    const stopPropagation1 = vi.fn();
    (prevButtons1[0].props.onClick as (e: { stopPropagation: () => void }) => void)({
      stopPropagation: stopPropagation1,
    });
    expect(stopPropagation1).toHaveBeenCalledTimes(1);
    expect(state).toEqual({ phase: 'intro', beatIndex: 0 });
  });

  it('skips directly from Sub-State 3A to Sub-State 3B when clicking "Bỏ qua"', () => {
    let state = createInitialBriefingState('entry', SAMPLE_BRIEFING.introBeats.length);
    const tree = LevelContextBriefingSurface({
      briefing: SAMPLE_BRIEFING,
      mode: 'entry',
      flowState: state,
      onAdvanceBeat: vi.fn(),
      onPrevBeat: vi.fn(),
      onSkipIntro: () => {
        state = reduceBriefingFlowState(state, { type: 'skip' });
      },
    });

    const skipButtons = findElements(
      tree,
      el => isButtonElement(el) && extractText(el.props.children as React.ReactNode).trim() === 'Bỏ qua',
    );
    expect(skipButtons).toHaveLength(1);
    expect(String(skipButtons[0].props.className)).toContain('touch-target-min');
    (skipButtons[0].props.onClick as () => void)();

    expect(state.phase).toBe('briefing');
  });

  it('renders responsive aged paper Sub-State 3B casefile with red stamp, large portrait, wife profile mini-card, alibi, and suspicion hook', () => {
    const onBack = vi.fn();
    const onStartInvestigation = vi.fn();
    const briefingState = { phase: 'briefing' as const, beatIndex: 0 };

    const html = renderToStaticMarkup(
      <LevelContextBriefingSurface
        briefing={SAMPLE_BRIEFING}
        mode="entry"
        flowState={briefingState}
        onBack={onBack}
        onStartInvestigation={onStartInvestigation}
        onAdvanceBeat={vi.fn()}
        onPrevBeat={vi.fn()}
        onSkipIntro={vi.fn()}
      />,
    );

    expect(html).toContain('data-briefing-phase="briefing"');
    expect(html).toContain('h-[100dvh]');
    expect(html).toContain('max-w-4xl');
    expect(html).toContain('bg-game-paper');
    expect(html).toContain('border-game-paper-border');
    expect(html).toContain('text-game-ink');
    expect(html).toContain('HỒ SƠ MÀN 1');
    expect(html).toContain('w-40');
    expect(html).toContain('h-52');
    expect(html).toContain('md:w-48');
    expect(html).toContain('md:h-60');
    expect(html).toContain('Nguyễn Huy Hoàng');
    expect(html).toContain('29 tuổi');
    expect(html).toContain('Tech Lead · Technosoft (Hà Nội)');
    expect(html).toContain('Hồ sơ nhân vật');
    expect(html).toContain('Tự nhận sợ vợ số 1, nộp 90% lương tháng');
    expect(html).toContain('data-briefing-wife-profile="true"');
    expect(html).toContain('/assets/portraits/minh-thu.png');
    expect(html).toContain('Minh Thư');
    expect(html).toContain('Size M');
    expect(html).toContain('Lời khai tối nay');
    expect(html).toContain(SAMPLE_BRIEFING.statedAlibi);
    expect(html).toContain('Nghi vấn');
    expect(html).not.toContain('Linh cảm của vợ');
    expect(html).toContain(SAMPLE_BRIEFING.suspicionHook);
    expect(html).not.toContain('Ứng dụng');
    expect(html).not.toContain('Lượt nghi ngờ');
    expect(html).not.toContain('Bảo mật');
    expect(html).toContain('Mở điện thoại');
    expect(RAW_EMOJI_REGEX.test(html)).toBe(false);
    expect(EM_DASH_REGEX.test(html)).toBe(false);
    expect(html).not.toContain('font-mono');
    expect(ARBITRARY_TEXT_PX_REGEX.test(html)).toBe(false);

    const tree = LevelContextBriefingSurface({
      briefing: SAMPLE_BRIEFING,
      mode: 'entry',
      flowState: briefingState,
      onBack,
      onStartInvestigation,
      onAdvanceBeat: vi.fn(),
      onPrevBeat: vi.fn(),
      onSkipIntro: vi.fn(),
    });

    const startButtons = findElements(
      tree,
      el =>
        isButtonElement(el) &&
        extractText(el.props.children as React.ReactNode).includes('Mở điện thoại'),
    );
    expect(startButtons).toHaveLength(1);
    expect(String(startButtons[0].props.className)).toContain('bg-game-crimson');
    expect(String(startButtons[0].props.className)).toContain('min-h-[48px]');
    expect(String(startButtons[0].props.className)).toContain('touch-target-min');
    (startButtons[0].props.onClick as () => void)();
    expect(onStartInvestigation).toHaveBeenCalledTimes(1);

    const backButtons = findElements(
      tree,
      el => isButtonElement(el) && el.props['aria-label'] === 'Chọn màn',
    );
    expect(backButtons).toHaveLength(1);
    (backButtons[0].props.onClick as () => void)();
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('opens immediately as a read-only modal overlay in recall mode with "Đóng" and persona details', () => {
    const onClose = vi.fn();
    const recallHtml = renderToStaticMarkup(
      <LevelContextBriefing briefing={SAMPLE_BRIEFING} mode="recall" onClose={onClose} />,
    );

    expect(recallHtml).toContain('role="dialog"');
    expect(recallHtml).toContain('aria-modal="true"');
    expect(recallHtml).toContain('max-w-4xl');
    expect(recallHtml).toContain(SAMPLE_BRIEFING.levelTitle);
    expect(recallHtml).toContain('HỒ SƠ MÀN 1');
    expect(recallHtml).toContain('Đóng');
    expect(recallHtml).toContain('Hồ sơ nhân vật');
    expect(recallHtml).toContain('Minh Thư');
    expect(recallHtml).toContain('Lời khai tối nay');
    expect(recallHtml).toContain('Nghi vấn');
    expect(recallHtml).not.toContain('Mở điện thoại');
    expect(recallHtml).not.toContain('Bỏ qua');
    expect(recallHtml).not.toContain('Trước');
    expect(RAW_EMOJI_REGEX.test(recallHtml)).toBe(false);
    expect(EM_DASH_REGEX.test(recallHtml)).toBe(false);

    const recallTree = LevelContextBriefingSurface({
      briefing: SAMPLE_BRIEFING,
      mode: 'recall',
      flowState: createInitialBriefingState('recall', SAMPLE_BRIEFING.introBeats.length),
      onClose,
      onAdvanceBeat: vi.fn(),
      onPrevBeat: vi.fn(),
      onSkipIntro: vi.fn(),
    });

    const closeButtons = findElements(
      recallTree,
      el =>
        isButtonElement(el) &&
        extractText(el.props.children as React.ReactNode).includes('Đóng'),
    );
    expect(closeButtons).toHaveLength(1);
    expect(String(closeButtons[0].props.className)).toContain('touch-target-min');
    (closeButtons[0].props.onClick as () => void)();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

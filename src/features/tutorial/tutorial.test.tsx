import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  TUTORIAL_STORAGE_KEY,
  TutorialPopupGuide,
  createInitialTutorialState,
  dismissCurrentPopup,
  readLevel0Status,
  skipTutorialGuide,
  triggerTutorialStep,
  writeLevel0Status,
  type TutorialStepId,
} from './index';

describe('Level 0 Tutorial state helpers', () => {
  it('initializes at the opening goal step with goal already in seenSteps', () => {
    const state = createInitialTutorialState();
    expect(state).toEqual({
      activeStep: 'goal',
      dismissedCurrentPopup: false,
      guideSkipped: false,
      seenSteps: ['goal'],
      completed: false,
    });
  });

  it('dismisses the current popup without losing activeStep or seenSteps', () => {
    const initial = createInitialTutorialState();
    const dismissed = dismissCurrentPopup(initial);
    expect(dismissed.activeStep).toBe('goal');
    expect(dismissed.dismissedCurrentPopup).toBe(true);
    expect(dismissed.seenSteps).toEqual(['goal']);
    expect(dismissCurrentPopup(dismissed)).toBe(dismissed);
  });

  it('triggers each unseen coaching step once and ignores duplicate triggers', () => {
    let state = createInitialTutorialState();
    state = dismissCurrentPopup(state);

    state = triggerTutorialStep(state, 'open_messages');
    expect(state.activeStep).toBe('open_messages');
    expect(state.dismissedCurrentPopup).toBe(false);
    expect(state.seenSteps).toEqual(['goal', 'open_messages']);

    const dismissedMessages = dismissCurrentPopup(state);
    const repeated = triggerTutorialStep(dismissedMessages, 'open_messages');
    expect(repeated).toBe(dismissedMessages);
    expect(repeated.dismissedCurrentPopup).toBe(true);

    const openedNotebook = triggerTutorialStep(dismissedMessages, 'open_notebook');
    expect(openedNotebook.activeStep).toBe('open_notebook');
    expect(openedNotebook.seenSteps).toEqual(['goal', 'open_messages', 'open_notebook']);
  });

  it('suppresses subsequent coaching popups after skipTutorialGuide but still displays complete', () => {
    let state = createInitialTutorialState();
    state = skipTutorialGuide(state);
    expect(state.guideSkipped).toBe(true);
    expect(state.dismissedCurrentPopup).toBe(true);

    const suppressed = triggerTutorialStep(state, 'pin_message');
    expect(suppressed).toBe(state);
    expect(suppressed.seenSteps).not.toContain('pin_message');

    const completed = triggerTutorialStep(suppressed, 'complete');
    expect(completed.activeStep).toBe('complete');
    expect(completed.dismissedCurrentPopup).toBe(false);
    expect(completed.completed).toBe(true);
    expect(completed.seenSteps).toContain('complete');
  });
});

describe('Level 0 Tutorial localStorage persistence', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to not_started in SSR environments without window', () => {
    expect(readLevel0Status()).toBe('not_started');
    expect(() => writeLevel0Status('completed')).not.toThrow();
  });

  it('reads and writes valid Level0Status values safely', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
      },
    });

    expect(readLevel0Status()).toBe('not_started');

    writeLevel0Status('skipped');
    expect(store.get(TUTORIAL_STORAGE_KEY)).toBe('skipped');
    expect(readLevel0Status()).toBe('skipped');

    writeLevel0Status('completed');
    expect(readLevel0Status()).toBe('completed');

    store.set(TUTORIAL_STORAGE_KEY, 'corrupted_value');
    expect(readLevel0Status()).toBe('not_started');
  });

  it('handles storage exceptions gracefully', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => {
          throw new Error('SecurityError');
        },
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
      },
    });

    expect(readLevel0Status()).toBe('not_started');
    expect(() => writeLevel0Status('completed')).not.toThrow();
  });
});

describe('TutorialPopupGuide component', () => {
  const baseProps = {
    onDismiss: vi.fn(),
    onSkipGuide: vi.fn(),
    onEnterLevel1: vi.fn(),
    onReplayLevel0: vi.fn(),
  };

  const allSteps: readonly TutorialStepId[] = [
    'goal',
    'open_messages',
    'pin_message',
    'open_phone',
    'open_notebook',
    'connect_alias',
    'independent_alibi',
    'confrontation_rules',
    'complete',
  ];

  it('renders nothing when hidden or when step is null', () => {
    expect(renderToStaticMarkup(<TutorialPopupGuide {...baseProps} step="goal" visible={false} />)).toBe('');
    expect(renderToStaticMarkup(<TutorialPopupGuide {...baseProps} step={null} visible={true} />)).toBe('');
  });

  it('never uses backdrop-blur, border-l-4, 0,4 giây, Zola, font-mono, or em dashes across all steps', () => {
    for (const step of allSteps) {
      const html = renderToStaticMarkup(
        <TutorialPopupGuide {...baseProps} step={step} visible={true} />,
      );
      expect(html).not.toContain('backdrop-blur');
      expect(html).not.toContain('border-l-4');
      expect(html).not.toContain('border-t-4');
      expect(html).not.toContain('bg-game-backdrop');
      expect(html).not.toContain('0,4');
      expect(html).not.toContain('Zola');
      expect(html).not.toContain('font-mono');
      expect(html).not.toContain('—');
    }
  });

  it('renders Step 1 (goal) with centered light scrim, 4-step loop, Bắt đầu thôi, and compact borderless Bỏ qua', () => {
    const html = renderToStaticMarkup(
      <TutorialPopupGuide {...baseProps} step="goal" visible={true} />,
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('bg-black/35');
    expect(html).toContain('Bước 1 / 8');
    expect(html).toContain('Chào mừng thám tử');
    expect(html).toContain('Lướt các ứng dụng trên máy để tìm chi tiết lạ');
    expect(html).toContain('Nhấn giữ vào thông tin nghi ngờ để ghim lại');
    expect(html).toContain('Vào Sổ tay nối các manh mối khớp nhau');
    expect(html).toContain('Bấm Đối chất để hỏi thẳng mặt anh ấy');
    expect(html).toContain('Bắt đầu thôi');
    expect(html).toContain('border-0 bg-transparent px-2 min-h-[44px]');
    expect(html).toContain('>Bỏ qua</button>');
    expect(html).not.toContain('Bỏ qua hướng dẫn');
    expect(html).toContain('<svg');
  });

  it('renders bottom coach cards (Steps 2 to 6b) with bg-black/15 scrim, expected guidance, and Đã hiểu action', () => {
    const cases: Array<{ step: TutorialStepId; eyebrow: string; title: string; snippet: string }> = [
      {
        step: 'open_messages',
        eyebrow: 'Bước 2 / 8',
        title: 'Có tin nhắn lạ',
        snippet: 'Tin nhắn',
      },
      {
        step: 'pin_message',
        eyebrow: 'Bước 3 / 8',
        title: 'Ghim manh mối đầu tiên',
        snippet: 'nhấn giữ',
      },
      {
        step: 'open_phone',
        eyebrow: 'Bước 4 / 8',
        title: 'Kiểm tra danh bạ',
        snippet: 'chạm thanh ngang dưới cùng',
      },
      {
        step: 'open_notebook',
        eyebrow: 'Bước 5 / 8',
        title: 'Mở Sổ tay điều tra',
        snippet: 'biểu tượng cuốn sổ có số đỏ ở mép phải màn hình',
      },
      {
        step: 'connect_alias',
        eyebrow: 'Bước 6 / 8',
        title: 'Nối dây vạch mặt',
        snippet: 'chạm vào thẻ thứ nhất, rồi chạm tiếp vào thẻ thứ hai',
      },
      {
        step: 'independent_alibi',
        eyebrow: 'Bước 6 / 8',
        title: 'Tự tìm bằng chứng nói dối',
        snippet: 'Ảnh (Photos)',
      },
    ];

    for (const item of cases) {
      const html = renderToStaticMarkup(
        <TutorialPopupGuide {...baseProps} step={item.step} visible={true} />,
      );
      expect(html).toContain('bg-black/15');
      expect(html).toContain(item.eyebrow);
      expect(html).toContain(item.title);
      expect(html).toContain(item.snippet);
      expect(html).toContain('Đã hiểu');
      expect(html).toContain('border-0 bg-transparent px-2 min-h-[44px]');
      expect(html).toContain('>Bỏ qua</button>');
      expect(html).not.toContain('Bỏ qua hướng dẫn');
    }
  });

  it('renders Step 7 (confrontation_rules) with centered scrim, SVG star rules, and Vào hỏi tội thôi CTA', () => {
    const html = renderToStaticMarkup(
      <TutorialPopupGuide {...baseProps} step="confrontation_rules" visible={true} />,
    );

    expect(html).toContain('bg-black/35');
    expect(html).toContain('Bước 7 / 8');
    expect(html).toContain('Chuẩn bị Đối chất');
    expect(html).toContain('Cách tính sao (từ Màn 1 trở đi)');
    expect(html).toContain('1 sao:');
    expect(html).toContain('2 sao:');
    expect(html).toContain('3 sao:');
    expect(html).toContain('Màn 0 là màn tập nên bạn cứ thử thoải mái');
    expect(html).toContain('Vào hỏi tội thôi');
    expect(html).toContain('>Bỏ qua</button>');
    // Trophy icon + 1 + 2 + 3 star SVGs + arrow icon = 8 SVG icons total
    const svgMatches = html.match(/<svg/g) ?? [];
    expect(svgMatches.length).toBe(8);
  });

  it('renders Step 8 (complete) with centered scrim, normal-level reminder, and Level 1 / Replay actions', () => {
    const html = renderToStaticMarkup(
      <TutorialPopupGuide {...baseProps} step="complete" visible={true} />,
    );

    expect(html).toContain('bg-black/35');
    expect(html).toContain('Xuất sắc, xong Màn 0');
    expect(html).toContain('Xem - Ghim - Nối dây - Đối chất.');
    expect(html).toContain('Nhắc nhỏ trước khi vào Màn 1');
    expect(html).toContain('Hỏi tội khi chưa đủ chứng cứ sẽ bị trừ điểm tin tưởng.');
    expect(html).toContain('Vào Màn 1 ngay');
    expect(html).toContain('Chơi lại Màn 0');
    expect(html).toContain('min-h-[48px]');
    expect(html).not.toContain('>Bỏ qua</button>');
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { EcommerceApp } from './EcommerceApp';
import { loadCase } from '../../features/case-runtime';
import type { EcommerceView } from './types';

const mockState = vi.hoisted(() => ({
  screen: 'orders' as EcommerceView['screen'],
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState: <T,>(initial: T | (() => T)) => {
      if (
        Array.isArray(initial) &&
        initial.length === 1 &&
        typeof initial[0] === 'object' &&
        initial[0] !== null &&
        'screen' in initial[0]
      ) {
        return [[{ screen: mockState.screen }] as unknown as T, vi.fn()];
      }
      return actual.useState(initial);
    },
  };
});

describe('EcommerceApp bottom tab bar on orders view', () => {
  beforeEach(() => {
    mockState.screen = 'orders';
  });

  it('keeps the bottom tab bar mounted on orders with Tôi marked as current page', () => {
    const caseData = loadCase('case_01');
    const html = renderToStaticMarkup(
      <EcommerceApp
        caseData={caseData}
        onReturnHome={vi.fn()}
        onTagSuspect={vi.fn()}
        unlockedChallenges={new Set()}
      />,
    );

    expect(html).toContain('aria-label="Điều hướng Mua sắm"');
    const navHtml = html.slice(html.indexOf('aria-label="Điều hướng Mua sắm"'));
    expect(navHtml).toContain('aria-current="page"');
    const currentBtnMatch = navHtml.match(/<button[^>]*aria-current="page"[^>]*>.*?<\/button>/);
    expect(currentBtnMatch?.[0]).toContain('Tôi');
    expect(navHtml).not.toMatch(/<button[^>]*aria-current="page"[^>]*>.*?Trang chủ/);
    expect(navHtml).not.toMatch(/<button[^>]*aria-current="page"[^>]*>.*?Thông báo/);
  });

  it('still renders the back button in the header on orders while keeping tabs mounted', () => {
    const caseData = loadCase('case_01');
    const html = renderToStaticMarkup(
      <EcommerceApp
        caseData={caseData}
        onReturnHome={vi.fn()}
        onTagSuspect={vi.fn()}
        unlockedChallenges={new Set()}
      />,
    );

    expect(html).toContain('aria-label="Quay lại"');
    expect(html).toContain('Đơn đã mua');
    expect(html).toContain('aria-label="Điều hướng Mua sắm"');
  });

  it('hides the bottom tab bar on non-tab sub-screens like inbox', () => {
    mockState.screen = 'inbox';
    const caseData = loadCase('case_01');
    const html = renderToStaticMarkup(
      <EcommerceApp
        caseData={caseData}
        onReturnHome={vi.fn()}
        onTagSuspect={vi.fn()}
        unlockedChallenges={new Set()}
      />,
    );

    expect(html).not.toContain('aria-label="Điều hướng Mua sắm"');
  });
});

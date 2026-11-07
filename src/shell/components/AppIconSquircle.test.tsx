import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AppIconSquircle } from './AppIconSquircle';
import type { AppDefinition } from '../../shared/contracts/app-contracts';

const mockApp: AppDefinition = {
  appId: 'banking',
  displayName: 'Techcornbank',
  icon: () => null,
  component: () => null,
  themeGradient: 'from-red-500 to-rose-600',
  themeColor: '#ED1C24',
  bottomBarColor: '#FFFFFF',
  isLocked: false,
};

describe('AppIconSquircle markup and touch feedback hooks', () => {
  it('renders phone-app-icon-overlay element and data-launch-app attribute', () => {
    const html = renderToStaticMarkup(
      createElement(AppIconSquircle, {
        app: mockApp,
        onClick: () => {},
      })
    );

    expect(html).toContain('data-launch-app="banking"');
    expect(html).toContain('phone-app-icon-overlay');
  });

  it('renders grayed out apps with data-grayed-out attribute', () => {
    const html = renderToStaticMarkup(
      createElement(AppIconSquircle, {
        app: mockApp,
        onClick: () => {},
        isGrayedOut: true,
      })
    );

    expect(html).toContain('data-grayed-out="true"');
    expect(html).toContain('aria-disabled="true"');
  });
});

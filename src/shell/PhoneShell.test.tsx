import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppDefinition } from '../shared/contracts/app-contracts';
import { PhoneShell, type PhoneShellProps } from './PhoneShell';

const noop = () => {};
const app: AppDefinition = {
  appId: 'banking', displayName: 'Banking', icon: () => null, component: () => null,
  themeGradient: '', themeColor: '#ED1C24', bottomBarColor: '#FFFFFF', isLocked: false,
};
const props: PhoneShellProps = {
  deviceMetadata: { narrativeTime: '23:45', batteryPercent: '42%', carrierTag: '', pwaThemeColor: '#ED1C24' },
  activeAppId: 'banking', activeAppDefinition: app, activeUpperApps: [app], activeDockApps: [],
  systemAlertToast: null,
  children: <main>App content</main>, overlays: null, renderLevelSelector: () => null,
  onLaunchApp: noop, onReturnHome: noop, onRestartLevel: noop, onOpenNotebook: noop, onNotify: noop,
};

beforeEach(() => {
  vi.stubGlobal('window', { matchMedia: () => ({ matches: false }) });
  vi.stubGlobal('navigator', { userAgent: 'Desktop', maxTouchPoints: 0 });
});
afterEach(() => vi.unstubAllGlobals());

describe('app surface and stationary system chrome', () => {
  it('places both bar backgrounds and the app inside one surface, with glyphs outside', () => {
    const html = renderToStaticMarkup(<PhoneShell {...props} />);
    const surface = html.indexOf('data-app-surface');
    const statusBackground = html.indexOf('data-app-status-background');
    const viewport = html.indexOf(' data-app-viewport=');
    const bottomBackground = html.indexOf('data-app-home-background');
    const homeControl = html.indexOf('phone-system-home');
    expect(html.indexOf('phone-system-status')).toBeLessThan(surface);
    expect(statusBackground).toBeGreaterThan(surface);
    expect(viewport).toBeGreaterThan(statusBackground);
    expect(bottomBackground).toBeGreaterThan(viewport);
    expect(homeControl).toBeGreaterThan(bottomBackground);
    expect(html.slice(surface, statusBackground)).toContain('background-color:#ED1C24');
    expect(html.slice(bottomBackground, homeControl)).toContain('background-color:#FFFFFF');
    expect(html.slice(homeControl)).toContain('color:#000000');
    // The app covers a live glass launcher; hiding its entire tree would force
    // glass into a snapshot and change its compositing during app transitions.
    expect(html).toContain('data-launcher-hidden="true"');
    expect(html.match(/class="phone-launcher[^"]*"/)?.[0]).not.toContain('invisible');
  });

  it('keeps app content mounted but hidden and inert on Home', () => {
    const html = renderToStaticMarkup(<PhoneShell {...props} activeAppId="home" activeAppDefinition={null} />);
    expect(html).toContain('data-app-surface="true" hidden="" inert="" aria-hidden="true"');
    expect(html).toContain('<main>App content</main>');
    expect(html).toContain('display:none');
    expect(html).toContain('data-launcher-hidden="false"');
    expect(html).toContain('--phone-system-top:59px');
    expect(html).toContain('--phone-system-bottom:calc(34px + env(safe-area-inset-bottom, 0px))');
    expect(html.slice(html.indexOf('phone-system-home'))).toContain('color:#FFFFFF');
    expect(html).toContain('touch-action:none');
  });

  it('uses native iOS safe areas without rendering duplicate system indicators', () => {
    vi.stubGlobal('navigator', { userAgent: 'iPhone', maxTouchPoints: 5 });
    const html = renderToStaticMarkup(<PhoneShell {...props} />);
    expect(html).toContain('--phone-system-top:env(safe-area-inset-top, 0px)');
    expect(html).toContain('--phone-system-bottom:env(safe-area-inset-bottom, 0px)');
    expect(html).toContain('data-app-surface');
    expect(html).not.toContain('phone-system-status');
    expect(html).not.toContain('phone-system-home');
  });

  it('renders phone-system-home with accessible home label on non-iOS', () => {
    const html = renderToStaticMarkup(<PhoneShell {...props} />);
    expect(html).toContain('phone-system-home');
    expect(html).toContain('aria-label="Về trang chủ"');
  });

  it('renders grayed out apps with data-grayed-out, aria-disabled, and future development aria label', () => {
    const html = renderToStaticMarkup(
      <PhoneShell {...props} activeAppId="home" activeAppDefinition={null} grayedOutAppIds={['banking']} />
    );
    expect(html).toContain('data-grayed-out="true"');
    expect(html).toContain('aria-disabled="true"');
    expect(html).toContain('aria-label="Ứng dụng Banking (Tính năng đang phát triển)"');
  });

  it('renders all 12 apps across upper grid and dock with level-scoped disabled states', () => {
    const upperApps = [
      { appId: 'ecommerce', displayName: 'Shopoo', icon: () => null, component: () => null, themeGradient: '', themeColor: '#f97316' },
      { appId: 'ride-hailing', displayName: 'BeGo', icon: () => null, component: () => null, themeGradient: '', themeColor: '#eab308' },
      { appId: 'web-browser', displayName: 'Sari', icon: () => null, component: () => null, themeGradient: '', themeColor: '#3b82f6' },
      { appId: 'photos', displayName: 'Ảnh', icon: () => null, component: () => null, themeGradient: '', themeColor: '#ec4899' },
      { appId: 'email', displayName: 'GeeMail', icon: () => null, component: () => null, themeGradient: '', themeColor: '#ef4444' },
      { appId: 'professional-network', displayName: 'InkedLin', icon: () => null, component: () => null, themeGradient: '', themeColor: '#0284c7' },
      { appId: 'team-collaboration', displayName: 'Tim', icon: () => null, component: () => null, themeGradient: '', themeColor: '#6366f1' },
      { appId: 'personal-notes', displayName: 'Ghi chú', icon: () => null, component: () => null, themeGradient: '', themeColor: '#f59e0b' },
    ] as unknown as AppDefinition[];
    const dockApps = [
      { appId: 'phone', displayName: 'Điện thoại', icon: () => null, component: () => null, themeGradient: '', themeColor: '#22c55e' },
      { appId: 'internet-messaging', displayName: 'Zola', icon: () => null, component: () => null, themeGradient: '', themeColor: '#0068FF' },
      { appId: 'banking', displayName: 'Techcornbank', icon: () => null, component: () => null, themeGradient: '', themeColor: '#ED1C24' },
      { appId: 'messages', displayName: 'Tin nhắn', icon: () => null, component: () => null, themeGradient: '', themeColor: '#10b981' },
    ] as unknown as AppDefinition[];

    const html = renderToStaticMarkup(
      <PhoneShell
        {...props}
        activeAppId="home"
        activeAppDefinition={null}
        activeUpperApps={upperApps}
        activeDockApps={dockApps}
        grayedOutAppIds={['ride-hailing', 'web-browser', 'email', 'professional-network', 'team-collaboration', 'personal-notes']}
      />
    );

    expect(html).toContain('data-launch-app="ecommerce"');
    expect(html).toContain('data-launch-app="ride-hailing"');
    expect(html).toContain('data-launch-app="phone"');
    expect(html).toContain('data-launch-app="messages"');

    const ecommerceIdx = html.indexOf('data-launch-app="ecommerce"');
    const ecommerceTag = html.slice(ecommerceIdx, ecommerceIdx + 200);
    expect(ecommerceTag).not.toContain('aria-disabled="true"');
    expect(ecommerceTag).not.toContain('data-grayed-out="true"');

    const rideIdx = html.indexOf('data-launch-app="ride-hailing"');
    const rideTag = html.slice(rideIdx, rideIdx + 200);
    expect(rideTag).toContain('aria-disabled="true"');
    expect(rideTag).toContain('data-grayed-out="true"');
  });

  it('hides status bar on mobile when not in fullscreen mode', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Linux; Android 14)', maxTouchPoints: 5 });
    vi.stubGlobal('document', { fullscreenElement: null });
    const html = renderToStaticMarkup(<PhoneShell {...props} />);
    expect(html).not.toContain('phone-system-status');
    expect(html).toContain('--phone-system-top:env(safe-area-inset-top, 0px)');
  });

  it('shows status bar on mobile when in fullscreen mode', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Linux; Android 14)', maxTouchPoints: 5 });
    vi.stubGlobal('document', { fullscreenElement: {} });
    const html = renderToStaticMarkup(<PhoneShell {...props} />);
    expect(html).toContain('phone-system-status');
    expect(html).toContain('--phone-system-top:59px');
  });

  it('applies 3D backwards perspective zoom out to phone screen when notebook is open', () => {
    const htmlOpen = renderToStaticMarkup(<PhoneShell {...props} notebookOpen={true} />);
    expect(htmlOpen).toContain('data-phone-screen="true"');
    expect(htmlOpen).toContain('perspective(1000px) translate3d(0, 0, -18px) scale(0.97)');
    expect(htmlOpen).toContain('border-radius:28px');

    const htmlClosed = renderToStaticMarkup(<PhoneShell {...props} notebookOpen={false} />);
    expect(htmlClosed).toContain('perspective(1000px) translate3d(0, 0, 0px) scale(1)');
    expect(htmlClosed).toContain('border-radius:0px');
  });
});


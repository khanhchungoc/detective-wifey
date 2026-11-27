import { expect, test, type Page } from '@playwright/test';
import { launchApp, startCleanPhone, swipeUpHome } from './helpers/phone';

// Reduced motion skips the view-transition fly-out, which is exactly what this spec observes.
test.use({ reducedMotion: 'no-preference' });

type Sample = { x: number; y: number; scale: number };
type SampleWindow = Window & { __cardSamples?: Sample[] };

async function center(page: Page, selector: string): Promise<{ x: number; y: number }> {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`${selector} has no bounding box`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test.describe('App switch animation', () => {
  test('swipe-up close flies the Zola card onto its icon', async ({ page }) => {
    const errors = await startCleanPhone(page);
    const iconSelector = '[data-launch-app="internet-messaging"]';
    await launchApp(page, 'internet-messaging');
    const cardCenter = await center(page, '[data-app-surface]');

    // The closing card is a view-transition snapshot (not a DOM node), so read its animated
    // transform from the ::view-transition-old(phone-app) pseudo element on every frame.
    await page.evaluate(() => {
      const w = window as SampleWindow;
      w.__cardSamples = [];
      const tick = (): void => {
        const t = getComputedStyle(document.documentElement, '::view-transition-old(phone-app)').transform;
        const m = /^matrix\(([^)]+)\)$/.exec(t);
        if (m) {
          const v = m[1].split(',').map(Number);
          w.__cardSamples?.push({ x: v[4], y: v[5], scale: v[0] });
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    await swipeUpHome(page);
    await expect(page.locator('[data-app-surface]')).toBeHidden();
    await expect(page.locator(iconSelector).first()).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.motion ?? '')).toBe('');

    const samples = await page.evaluate(() => (window as SampleWindow).__cardSamples ?? []);
    expect(samples.length, 'close animation produced snapshot frames').toBeGreaterThan(2);

    const icon = await center(page, iconSelector);
    const last = samples[samples.length - 1];
    const finalCenter = { x: cardCenter.x + last.x, y: cardCenter.y + last.y };
    // Card ends on the icon (a few dozen px) and shrank to icon size, not stuck mid-screen.
    expect(Math.hypot(finalCenter.x - icon.x, finalCenter.y - icon.y)).toBeLessThan(40);
    expect(last.scale).toBeLessThan(0.3);

    expect(errors).toEqual([]);
  });
});

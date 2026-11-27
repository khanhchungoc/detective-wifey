import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  launchApp,
  startCleanPhone,
} from './helpers/phone';

/**
 * Local long-press: holds a real touch until the evidence dialog opens, then drags the finger
 * away before lifting so the release cannot become a tap on the modal backdrop.
 */
async function pinByLongPress(page: Page, target: Locator): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) throw new Error('Cannot long-press element without a bounding box');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const dialog = page.getByRole('dialog');
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  try {
    await expect(dialog).toBeVisible({ timeout: 2500 });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 60, y: y + 60 }] });
  } finally {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    await cdp.detach();
  }
  const pinBtn = dialog.getByRole('button', { name: 'Ghim', exact: true });
  await expect(pinBtn).toBeEnabled();
  await pinBtn.click();
  await expect(dialog).toBeHidden();
}

test.describe('Shopoo (E-Commerce) App', () => {
  test('opens orders/activity view and pins order evidence via long-press', async ({ page }) => {
    const errors = await startCleanPhone(page);

    await launchApp(page, 'ecommerce');

    // Navigate to Profile ("Tôi") -> All Orders ("Tất cả đơn") where order evidence lives
    await page.getByRole('button', { name: 'Tôi', exact: true }).click();
    await page.getByRole('button', { name: 'Tất cả đơn' }).click();

    const target = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(target).toBeVisible();
    await pinByLongPress(page, target);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /[1-9]\d* manh mối/);

    expect(errors).toEqual([]);
  });
});

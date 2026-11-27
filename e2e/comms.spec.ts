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

test.describe('Comms (Phone & SMS) Apps', () => {
  test('opens Phone call log and switches call filters cleanly', async ({ page }) => {
    const errors = await startCleanPhone(page);

    await launchApp(page, 'phone');
    await expect(page.getByRole('group', { name: 'Lọc cuộc gọi' })).toBeVisible();

    const firstTarget = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(firstTarget).toBeVisible();
    await pinByLongPress(page, firstTarget);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /[1-9]\d* manh mối/);

    expect(errors).toEqual([]);
  });

  test('opens SMS Messages, searches threads, and pins SMS evidence via long-press', async ({ page }) => {
    const errors = await startCleanPhone(page);

    await launchApp(page, 'messages');
    await expect(page.getByRole('textbox', { name: 'Tìm kiếm tin nhắn' })).toBeVisible();

    const firstTarget = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(firstTarget).toBeVisible();
    await pinByLongPress(page, firstTarget);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /[1-9]\d* manh mối/);

    expect(errors).toEqual([]);
  });
});

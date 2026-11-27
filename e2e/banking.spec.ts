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

test.describe('Techcornbank (Banking) App', () => {
  test('loads account dashboard, navigates tabs, and pins transaction evidence via long-press', async ({ page }) => {
    const errors = await startCleanPhone(page);

    await launchApp(page, 'banking');

    // Banking navigation bar is visible
    const nav = page.locator('[data-app-viewport] nav');
    await expect(nav).toBeVisible();

    // Find an evidence target (transaction row) and pin it via 380ms long-press
    const txTarget = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    if (!(await txTarget.isVisible({ timeout: 1500 }).catch(() => false))) {
      // Switch to history/transactions tab if not on home
      const navButtons = nav.getByRole('button');
      if ((await navButtons.count()) > 1) {
        await navButtons.nth(1).click();
      }
    }

    await expect(txTarget).toBeVisible();
    await pinByLongPress(page, txTarget);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /[1-9]\d* manh mối/);

    expect(errors).toEqual([]);
  });
});

import { expect, test } from '@playwright/test';
import {
  activeEvidence,
  launchApp,
  longPressAndPin,
  startCleanPhone,
  touchHold,
} from './helpers/phone';

test.describe('Universal Evidence Pinning @smoke', () => {
  test('opens evidence modal only on long-press, pins to notebook, and shows zero permanent pin buttons', async ({ page }) => {
    const errors = await startCleanPhone(page);

    await launchApp(page, 'internet-messaging');

    // Zero permanent "Ghim" button invariant on app screen
    await expect(page.locator('[data-app-viewport] button').filter({ hasText: /^Ghim$/ })).toHaveCount(0);

    // Normal tap on a thread opens it rather than opening the evidence modal
    const firstTarget = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(firstTarget).toBeVisible();
    await firstTarget.click();
    await expect(page.getByRole('dialog')).toBeHidden();

    // Long-press on an evidence target opens the dialog with both actions, then pin it
    const bubbleTarget = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(bubbleTarget).toBeVisible();
    await longPressAndPin(page, bubbleTarget, async (dialog) => {
      await expect(dialog.getByRole('button', { name: 'Bỏ qua' })).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Ghim', exact: true })).toBeVisible();
    });

    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /[1-9]\d* manh mối/);

    expect(errors).toEqual([]);
  });

  test('keeps the evidence modal open when the finger lifts after a long-press', async ({ page }) => {
    const errors = await startCleanPhone(page);

    await launchApp(page, 'internet-messaging');
    // Open the first chat, then long-press its first message bubble.
    await activeEvidence(page).first().click();
    const target = activeEvidence(page).first();
    await expect(target).toBeVisible();
    await target.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    const box = await target.boundingBox();
    if (!box) throw new Error('Cannot long-press element without a bounding box');

    const dialog = page.getByRole('dialog');
    await touchHold(page, { x: box.x + box.width / 2, y: box.y + box.height / 2 }, async () => {
      await expect(dialog).toBeVisible({ timeout: 2500 });
    });
    // A player lifting their finger must not dismiss the modal they just opened. The fixed wait
    // gives the browser time to fire the tap that follows the lift, which is what closes it today.
    await page.waitForTimeout(500);
    await expect(dialog.getByRole('button', { name: 'Ghim', exact: true })).toBeVisible();

    expect(errors).toEqual([]);
  });
});

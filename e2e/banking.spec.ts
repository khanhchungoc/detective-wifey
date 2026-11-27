import { expect, test } from '@playwright/test';
import {
  confirmEvidencePin,
  launchApp,
  longPressToPinModal,
  startCleanPhone,
} from './helpers/phone';

test.describe('VietPay (Banking) App', () => {
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
    const dialog = await longPressToPinModal(page, txTarget);
    await confirmEvidencePin(dialog);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /[1-9]\d* manh mối/);

    expect(errors).toEqual([]);
  });
});

import { expect, test } from '@playwright/test';
import {
  confirmEvidencePin,
  launchApp,
  longPressToPinModal,
  startCleanPhone,
} from './helpers/phone';

test.describe('Poshee (E-Commerce) App', () => {
  test('opens orders/activity view and pins order evidence via long-press', async ({ page }) => {
    const errors = await startCleanPhone(page);

    await launchApp(page, 'ecommerce');

    // Navigate to Profile ("Tôi") -> All Orders ("Tất cả đơn") where order evidence lives
    await page.getByRole('button', { name: 'Tôi', exact: true }).click();
    await page.getByRole('button', { name: 'Tất cả đơn' }).click();

    const target = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(target).toBeVisible();
    const dialog = await longPressToPinModal(page, target);
    await confirmEvidencePin(dialog);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /[1-9]\d* manh mối/);

    expect(errors).toEqual([]);
  });
});

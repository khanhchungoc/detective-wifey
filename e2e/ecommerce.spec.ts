import { expect, test } from '@playwright/test';
import {
  launchApp,
  longPressAndPin,
  startCleanPhone,
} from './helpers/phone';

test.describe('Shopoo (E-Commerce) App', () => {
  test('opens orders/activity view and pins order evidence via long-press', async ({ page }) => {
    const errors = await startCleanPhone(page);

    await launchApp(page, 'ecommerce');

    // Navigate to Profile ("Tôi") -> All Orders ("Tất cả đơn") where order evidence lives
    await page.getByRole('button', { name: 'Tôi', exact: true }).click();
    await page.getByRole('button', { name: 'Tất cả đơn' }).click();

    const target = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(target).toBeVisible();
    await longPressAndPin(page, target);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /[1-9]\d* manh mối/);

    expect(errors).toEqual([]);
  });
});

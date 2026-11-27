import { expect, test } from '@playwright/test';
import {
  launchApp,
  longPressAndPin,
  startCleanPhone,
} from './helpers/phone';

test.describe('Comms (Phone & SMS) Apps', () => {
  test('opens Phone call log and switches call filters cleanly', async ({ page }) => {
    const errors = await startCleanPhone(page);

    await launchApp(page, 'phone');
    await expect(page.getByRole('group', { name: 'Lọc cuộc gọi' })).toBeVisible();

    const firstTarget = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(firstTarget).toBeVisible();
    await longPressAndPin(page, firstTarget);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /[1-9]\d* manh mối/);

    expect(errors).toEqual([]);
  });

  test('opens SMS Messages, searches threads, and pins SMS evidence via long-press', async ({ page }) => {
    const errors = await startCleanPhone(page);

    await launchApp(page, 'messages');
    await expect(page.getByRole('textbox', { name: 'Tìm kiếm tin nhắn' })).toBeVisible();

    const firstTarget = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(firstTarget).toBeVisible();
    await longPressAndPin(page, firstTarget);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /[1-9]\d* manh mối/);

    expect(errors).toEqual([]);
  });
});

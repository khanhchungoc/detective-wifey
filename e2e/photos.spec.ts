import { expect, test } from '@playwright/test';
import {
  confirmEvidencePin,
  launchApp,
  longPressToPinModal,
  startCleanPhone,
} from './helpers/phone';

test.describe('Photos App', () => {
  test('opens Photos gallery, views photo detail, and pins photo evidence via long-press', async ({ page }) => {
    const errors = await startCleanPhone(page);

    await launchApp(page, 'photos');

    const firstPhoto = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(firstPhoto).toBeVisible();

    // Long-press photo to pin evidence
    const dialog = await longPressToPinModal(page, firstPhoto);
    await confirmEvidencePin(dialog);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /[1-9]\d* manh mối/);

    expect(errors).toEqual([]);
  });
});

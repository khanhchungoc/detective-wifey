import { expect, test } from '@playwright/test';
import {
  confirmEvidencePin,
  launchApp,
  longPressToPinModal,
  startCleanPhone,
} from './helpers/phone';

test.describe('Universal Evidence Pinning @smoke', () => {
  test('triggers evidence modal only on 380ms long-press, pins to notebook, and enforces zero permanent pin buttons', async ({ page }) => {
    const errors = await startCleanPhone(page);

    await launchApp(page, 'internet-messaging');

    // Zero permanent "Ghim" button invariant on app screen
    await expect(page.locator('[data-app-viewport] button').filter({ hasText: /^Ghim$/ })).toHaveCount(0);

    // Normal click on a thread opens it rather than opening evidence modal
    const firstTarget = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(firstTarget).toBeVisible();
    await firstTarget.click();
    await expect(page.getByRole('dialog')).toBeHidden();

    // Long-press on an evidence target opens UniversalEvidenceModal
    const bubbleTarget = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(bubbleTarget).toBeVisible();
    const dialog = await longPressToPinModal(page, bubbleTarget);
    await expect(dialog.getByRole('button', { name: 'Bỏ qua' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Ghim', exact: true })).toBeVisible();

    // Confirm pin and verify notebook badge count increments
    await confirmEvidencePin(dialog);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /[1-9]\d* manh mối/);

    expect(errors).toEqual([]);
  });
});

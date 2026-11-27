import { expect, test } from '@playwright/test';
import {
  confirmEvidencePin,
  launchApp,
  longPressToPinModal,
  startCleanPhone,
} from './helpers/phone';

test.describe('Wife Notebook & Confrontation @smoke', () => {
  test('displays pinned clue on corkboard and opens confrontation confirmation flow', async ({ page }) => {
    const errors = await startCleanPhone(page);

    // Pin one clue first
    await launchApp(page, 'internet-messaging');
    const firstTarget = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    const dialog = await longPressToPinModal(page, firstTarget);
    await confirmEvidencePin(dialog);

    // Open Wife's Notebook via floating NotebookTab
    await page.locator('[data-notebook-tab]').click();
    await expect(page.locator('button[title="Quay lại màn hình chính"]')).toBeVisible();

    // Corkboard contains at least one placed clue node
    await expect(page.locator('[data-node-id]').first()).toBeVisible();

    // Auto-arrange button works without errors
    await page.getByRole('button', { name: 'Xếp gọn' }).click();

    // Confrontation button opens confirmation modal and can launch confrontation
    const confrontBtn = page.getByRole('button', { name: /Đối chất/ });
    await expect(confrontBtn).toBeVisible();
    await confrontBtn.click();

    // Confirmation dialog appears; confirm or cancel cleanly
    const confirmModalBtn = page.getByRole('button', { name: /Vẫn đối chất|Bắt đầu đối chất|Đối chất ngay/ }).first();
    if (await confirmModalBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmModalBtn.click();
      // Scripted confrontation opening choices appear
      await expect(page.getByText(/Hoàng, anh có gì lừa dối tôi không|Tôi biết anh đang ngoại tình/)).toBeVisible();
    }

    expect(errors).toEqual([]);
  });
});

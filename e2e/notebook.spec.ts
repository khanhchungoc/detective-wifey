import { expect, test } from '@playwright/test';
import {
  activeEvidence,
  launchApp,
  longPressAndPin,
  startCleanPhone,
  swipeUpHome,
} from './helpers/phone';

test.describe('Wife Notebook & Confrontation @smoke', () => {
  test('shows a pinned clue on the corkboard and opens the confrontation flow', async ({ page }) => {
    const errors = await startCleanPhone(page);

    // Pin the Shopee order: it points at suspect Thu Hương, so she appears on the suspect list.
    await launchApp(page, 'ecommerce');
    await page.getByRole('button', { name: 'Tôi', exact: true }).click();
    await page.getByRole('button', { name: 'Tất cả đơn' }).click();
    await longPressAndPin(
      page,
      activeEvidence(page).filter({ hasText: 'Set váy lụa công sở' }).first(),
    );
    await swipeUpHome(page);

    // Open the notebook from the floating tab: the clue is a card on the corkboard.
    await page.locator('[data-notebook-tab]').click();
    await expect(page.locator('[data-node-id="node_record_ecommerce_order"]')).toBeVisible();
    await expect(page.locator('[aria-label^="Định vị bảng"]')).toHaveAttribute('aria-label', /1 manh mối/);

    // Auto-arrange keeps the card on the board.
    await page.getByRole('button', { name: 'Xếp gọn' }).click();
    await expect(page.locator('[data-node-id="node_record_ecommerce_order"]')).toBeVisible();

    // "ĐỐI CHẤT" -> suspect picker -> confirm step.
    await page.getByRole('button', { name: /Đối chất/i }).click();
    const picker = page.getByRole('dialog', { name: 'Chọn nghi phạm' });
    await expect(picker).toBeVisible();
    await picker.locator('[data-suspect-polaroid="suspect_huong"]').click();
    const confirm = page.getByRole('dialog', { name: 'Xác nhận đối chất' });
    await expect(confirm).toBeVisible();
    await expect(confirm.getByRole('alert')).toContainText('Đối chất thất bại');

    // Confirming opens the scripted interrogation with the two opening lines.
    await confirm.getByRole('button', { name: /!/ }).click();
    const interrogation = page.getByRole('dialog', { name: /Đối chất · / });
    await expect(interrogation).toBeVisible();
    await expect(interrogation.locator('[data-choice-id="open_ask"]')).toContainText('Hoàng, anh có gì lừa dối tôi không');
    await expect(interrogation.locator('[data-choice-id="open_offer"]')).toContainText('Tôi biết anh đang ngoại tình');

    // The interrogation can be closed without picking a line.
    await interrogation.getByRole('button', { name: 'Đóng đối chất' }).click();
    await expect(interrogation).toBeHidden();

    expect(errors).toEqual([]);
  });
});

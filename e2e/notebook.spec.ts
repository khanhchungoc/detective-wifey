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

    // Pin the Shopee order (size S dress, recipient phone matches "Khoa BE").
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

    // Opens in wall view; 1 tap on the board/card brings the board forward, double-tap puts it back on the wall.
    const board = page.locator('[data-board-mode]');
    const lampBeam = page.locator('.notebook-lamp-beam');
    const lampTube = page.locator('.notebook-lamp-tube');
    await expect(board).toHaveAttribute('data-board-mode', 'wall');
    await expect.poll(async () => Number(await lampBeam.evaluate(el => getComputedStyle(el).opacity))).toBeGreaterThan(0.5);
    await expect.poll(async () => Number(await lampTube.evaluate(el => getComputedStyle(el).opacity))).toBeGreaterThan(0.5);
    const card = page.locator('[data-node-id="node_record_ecommerce_order"]');
    await expect.poll(async () => (await card.boundingBox())!.width).toBeLessThan(100);
    const wallWidth = (await card.boundingBox())!.width;
    await card.click();
    await expect(board).toHaveAttribute('data-board-mode', 'focus');
    await expect.poll(async () => Number(await lampBeam.evaluate(el => getComputedStyle(el).opacity))).toBe(0);
    await expect.poll(async () => Number(await lampTube.evaluate(el => getComputedStyle(el).opacity))).toBe(0);
    await expect.poll(async () => (await card.boundingBox())!.width).toBeGreaterThan(wallWidth * 3);

    // Double tap on empty board puts the board back on the wall.
    const vp = page.viewportSize()!;
    await page.mouse.dblclick(vp.width / 2, vp.height - 190);
    await expect(board).toHaveAttribute('data-board-mode', 'wall');
    await expect.poll(async () => Number(await lampBeam.evaluate(el => getComputedStyle(el).opacity))).toBeGreaterThan(0.5);
    await expect.poll(async () => Math.round((await card.boundingBox())!.width)).toBe(Math.round(wallWidth));

    // Tapping the card again brings it forward; closing and reopening keeps the current view.
    await card.click();
    await expect(board).toHaveAttribute('data-board-mode', 'focus');
    await expect.poll(async () => (await card.boundingBox())!.width).toBeGreaterThan(wallWidth * 3);
    const focusedBox = await card.boundingBox();
    await page.getByRole('dialog', { name: 'Bảng bằng chứng' }).getByRole('button', { name: 'Đóng sổ tay của vợ' }).last().click();
    await expect(page.getByRole('dialog', { name: 'Bảng bằng chứng' })).toBeHidden();
    await page.locator('[data-notebook-tab]').click();
    await expect(board).toHaveAttribute('data-board-mode', 'focus');
    await expect.poll(async () => {
      const box = (await card.boundingBox())!;
      return Math.max(Math.abs(box.x - focusedBox!.x), Math.abs(box.y - focusedBox!.y));
    }).toBeLessThan(2);

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
    await expect(interrogation.locator('[data-choice-id="open_ask"]')).toContainText('Thịnh, anh có gì giấu tôi không');
    await expect(interrogation.locator('[data-choice-id="open_offer"]')).toContainText('Tôi biết hết rồi. Tôi cho anh một cơ hội nói thật');

    // The interrogation can be closed without picking a line.
    await interrogation.getByRole('button', { name: 'Đóng đối chất' }).click();
    await expect(interrogation).toBeHidden();

    expect(errors).toEqual([]);
  });
});

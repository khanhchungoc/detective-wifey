import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  activeEvidence,
  launchApp,
  longPressAndPin,
  startCleanPhone,
  swipeRightBack,
  swipeUpHome,
} from './helpers/phone';

/**
 * Level 1 (case_01) main loop: find clues in apps, pin them, connect them on the
 * evidence board, then confront the husband ("ĐỐI CHẤT").
 *
 * Win needs the three canonical strings (see level_01.json confrontationScript):
 *   edge_order_phone          Shopee order  <-> late call to "Khoa BE" (same number)
 *   edge_order_name           Shopee order  <-> HR pinned welcome for "Nguyễn Thị Thu Hương" (company group)
 *   edge_alibi_contradiction  Zola "Chưa em, sếp Hùng đang chốt nốt." (20:46) <-> card swipe 20:48
 * and accusing the culprit, suspect_01 (alias "Khoa BE").
 */

const WIN_CLUE_COUNT = 5;

async function pinShopeeOrder(page: Page): Promise<void> {
  await launchApp(page, 'ecommerce');
  await page.getByRole('button', { name: 'Tôi', exact: true }).click();
  await page.getByRole('button', { name: 'Tất cả đơn' }).click();
  await longPressAndPin(page, activeEvidence(page).filter({ hasText: 'Set váy lụa công sở' }).first());
  await swipeUpHome(page);
}

async function openBankHistory(page: Page): Promise<void> {
  await launchApp(page, 'banking');
  await page.getByRole('button', { name: /Tài khoản & Thẻ/ }).click();
}

async function pinBankRows(page: Page, rows: string[]): Promise<void> {
  await openBankHistory(page);
  for (const row of rows) {
    await longPressAndPin(page, activeEvidence(page).filter({ hasText: row }).first());
  }
  await swipeUpHome(page);
}

async function pinKhoaCall(page: Page): Promise<void> {
  await launchApp(page, 'phone');
  await longPressAndPin(
    page,
    activeEvidence(page).filter({ hasText: 'Khoa BE' }).filter({ hasText: '23:20' }).first(),
  );
  await swipeUpHome(page);
}

async function pinMessage(page: Page, threadPreview: string, message: string): Promise<void> {
  await launchApp(page, 'internet-messaging');
  // The app reopens the last chat; go back to the inbox first.
  const backButton = page.locator('[data-app-instance]:not([hidden]) [aria-label="Quay lại danh sách chat"]');
  if (await backButton.count()) {
    await swipeRightBack(page);
    await expect(backButton).toHaveCount(0);
  }
  await activeEvidence(page).filter({ hasText: threadPreview }).first().click();
  await longPressAndPin(page, activeEvidence(page).filter({ hasText: message }).first());
  await swipeUpHome(page);
}

async function openNotebook(page: Page): Promise<void> {
  await page.locator('[data-notebook-tab]').click();
  await expect(page.locator('[data-node-id]').first()).toBeVisible();
}

/** Waits until the camera flight ends (card box stops moving between frames). */
async function waitForCardToSettle(card: Locator): Promise<void> {
  let last = '';
  await expect.poll(async () => {
    const box = JSON.stringify(await card.boundingBox());
    const settled = box === last;
    last = box;
    return settled;
  }, { intervals: [100] }).toBe(true);
}

/**
 * Taps a corkboard card. The board is wider than the phone, so pan with the wheel
 * until the card is clearly on screen first.
 */
async function tapCard(page: Page, nodeId: string): Promise<void> {
  const vp = page.viewportSize();
  if (!vp) throw new Error('No viewport');
  const card = page.locator(`[data-node-id="${nodeId}"]`);
  // The board opens in wall view: a single tap on a card brings the board forward into focus view.
  if (await page.locator('[data-board-mode="wall"]').count()) {
    await card.click();
    await expect(page.locator('[data-board-mode="focus"]')).toBeVisible();
    await waitForCardToSettle(card);
  }
  const centerX = async (): Promise<number> => {
    const box = await card.boundingBox();
    if (!box) throw new Error(`Card ${nodeId} has no bounding box`);
    return box.x + box.width / 2;
  };
  const onScreen = (x: number): boolean => x > 80 && x < vp.width - 80;
  await page.mouse.move(vp.width / 2, vp.height / 2);
  for (let attempt = 0; attempt < 6 && !onScreen(await centerX()); attempt++) {
    const before = await centerX();
    await page.mouse.wheel(before - vp.width / 2, 0);
    await expect.poll(centerX).not.toBe(before);
  }
  // Tap 30% into the visible part of the card: strings pinned at the top-center can run down over
  // the card's middle, and the screen's left edge belongs to the swipe-back gesture.
  const box = await card.boundingBox();
  if (!box) throw new Error(`Card ${nodeId} has no bounding box`);
  const left = Math.max(box.x, 60);
  const right = Math.min(box.x + box.width, vp.width);
  await card.click({ position: { x: left + (right - left) * 0.3 - box.x, y: box.height / 2 } });
}

async function connectCards(page: Page, from: string, to: string): Promise<void> {
  await tapCard(page, from);
  await tapCard(page, to);
}

function keyProgress(page: Page): Locator {
  return page.locator('[aria-label^="Định vị bảng"]');
}

/** Notebook -> "ĐỐI CHẤT" -> pick suspect polaroid -> confirm. Leaves the interrogation dialog open. */
async function startConfrontation(page: Page, suspectId: string): Promise<Locator> {
  await page.getByRole('button', { name: /Đối chất/i }).click();
  const confirm = page.getByRole('dialog', { name: 'Chọn nghi phạm' });
  await expect(confirm).toBeVisible();
  await confirm.locator(`[data-suspect-polaroid="${suspectId}"]`).click();
  // Step 2 renames the dialog and shows a randomly worded "<LABEL>!" confirm button.
  const step2 = page.getByRole('dialog', { name: 'Xác nhận đối chất' });
  await expect(step2).toBeVisible();
  await step2.getByRole('button', { name: /!/ }).click();
  const interrogation = page.getByRole('dialog', { name: /Đối chất · / });
  await expect(interrogation).toBeVisible();
  return interrogation;
}

async function choose(interrogation: Locator, choiceId: string): Promise<void> {
  await interrogation.locator(`[data-choice-id="${choiceId}"]`).click();
}

test.describe('Level 1 main game loop', () => {
  test('finds clues, pins and connects them, then accusing the culprit wins the confrontation', async ({ page }) => {
    // Five pins across five apps plus three board links: longer than the default budget.
    test.setTimeout(90_000);
    const errors = await startCleanPhone(page);
    const tab = page.locator('[data-notebook-tab]');

    // Find and pin the five clues that carry the win through the real apps.
    await pinShopeeOrder(page);
    await expect(tab).toHaveAttribute('aria-label', /1 manh mối/);
    await pinBankRows(page, ['COM NIEU PHO CO']);
    await pinKhoaCall(page);
    await pinMessage(page, 'Anh về tới hầm rồi', 'sếp Hùng đang chốt nốt');
    await pinMessage(page, 'Technosoft - Toàn công ty', 'Chào mừng bạn Nguyễn Thị Thu Hương');
    await expect(tab).toHaveAttribute('aria-label', new RegExp(`${WIN_CLUE_COUNT} manh mối`));

    // Connect them on the evidence board: 3/3 key strings unlocks the strong beats.
    await openNotebook(page);
    await page.getByRole('button', { name: 'Xếp gọn' }).click();
    await expect(keyProgress(page)).toHaveAttribute('aria-label', /0\/3 mắt xích/);
    await connectCards(page, 'node_record_ecommerce_order', 'node_record_phone_call');
    await connectCards(page, 'node_record_ecommerce_order', 'node_bridge_name');
    await connectCards(page, 'node_record_wife_alibi', 'node_record_bank_receipt');
    await expect(keyProgress(page)).toHaveAttribute('aria-label', /3\/3 mắt xích/);

    // Confront Thịnh and accuse the right person, backing each beat with its string.
    const interrogation = await startConfrontation(page, 'suspect_01');
    await choose(interrogation, 'choice_001');
    await choose(interrogation, 'choice_003');
    await expect(interrogation.getByText(/Khoa là dev mới bên anh/)).toBeVisible();
    await choose(interrogation, 'choice_006');
    await expect(interrogation.getByText(/Hương bên Marketing nhờ anh/)).toBeVisible();
    await choose(interrogation, 'choice_009');
    await choose(interrogation, 'choice_012');

    // Win outcome: verdict roast, share and advance actions, and no failure warning.
    await expect(interrogation.getByText(/Anh fix bug hay fix luôn lời khai/)).toBeVisible();
    // Epilogue hook into Level 2 appears once after the ending.
    await expect(page.getByText(/Anh chan so em that a/)).toBeVisible();
    await expect(interrogation.getByRole('button', { name: /Tạo thẻ Roast/ })).toBeVisible();
    await expect(interrogation.getByTestId('confrontation-return-investigate')).toHaveCount(0);

    // Winning unlocks Level 2 in saved progress.
    await expect.poll(async () => page.evaluate(() => {
      const raw = window.localStorage.getItem('detective:v2:jealous_wife:progress');
      return raw ? (JSON.parse(raw) as { unlockedLevel?: number }).unlockedLevel : undefined;
    })).toBe(2);

    expect(errors).toEqual([]);
  });

  test('accusing the wrong person fails the confrontation', async ({ page }) => {
    const errors = await startCleanPhone(page);

    // Pin only Lan Anh's call log row: a red herring that puts her on the suspect list.
    await launchApp(page, 'phone');
    await longPressAndPin(page, activeEvidence(page).filter({ hasText: 'Lan Anh Kế Toán' }).first());
    await swipeUpHome(page);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /1 manh mối/);

    await openNotebook(page);
    const interrogation = await startConfrontation(page, 'suspect_04');
    await choose(interrogation, 'choice_001');
    await choose(interrogation, 'choice_003');

    // Lose outcome: Thịnh deflects, only "return to investigation" is offered, no verdict roast.
    await expect(interrogation.getByText(/Khoa là dev backend, nhắn việc với anh suốt/)).toBeVisible();
    await expect(interrogation.getByText(/Mất 1 lượt nghi ngờ/)).toBeVisible();
    await expect(interrogation.getByRole('button', { name: /Tạo thẻ Roast/ })).toHaveCount(0);
    await expect(interrogation.getByText(/Anh fix bug hay fix luôn lời khai/)).toHaveCount(0);

    // Retreating applies the strike and returns to the evidence board.
    await interrogation.getByTestId('confrontation-return-investigate').click();
    await expect(interrogation).toBeHidden();
    await expect(page.locator('[data-node-id]').first()).toBeVisible();

    // Losing must not unlock Level 2.
    const unlocked = await page.evaluate(() => {
      const raw = window.localStorage.getItem('detective:v2:jealous_wife:progress');
      return raw ? (JSON.parse(raw) as { unlockedLevel?: number }).unlockedLevel : undefined;
    });
    expect(unlocked ?? 1).toBe(1);

    expect(errors).toEqual([]);
  });
});

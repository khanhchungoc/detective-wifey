import { expect, test } from '@playwright/test';
import {
  confirmEvidencePin,
  launchApp,
  longPressToPinModal,
  startCleanPhone,
  swipeRightBack,
} from './helpers/phone';

test.describe('Zola (Internet Messaging) App', () => {
  test('opens a chat thread, pins a message via long-press, and swipes back to thread list', async ({ page }) => {
    const errors = await startCleanPhone(page);

    await launchApp(page, 'internet-messaging');

    // Open first conversation thread
    const firstThread = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(firstThread).toBeVisible();
    await firstThread.click();

    // Pin a message bubble inside the thread
    const firstBubble = page.locator('[data-app-viewport] [data-evidence-target="true"]').first();
    await expect(firstBubble).toBeVisible();
    const dialog = await longPressToPinModal(page, firstBubble);
    await confirmEvidencePin(dialog);

    // Swipe right pops back to thread list (still inside app)
    await swipeRightBack(page);
    await expect(page.locator('[data-app-viewport]')).toBeVisible();
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /[1-9]\d* manh mối/);

    expect(errors).toEqual([]);
  });
});

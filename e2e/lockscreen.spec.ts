import { expect, test } from '@playwright/test';
import { clearStorageOnFirstLoad, collectErrors, openLevelToLockscreen, touchSwipe, unlockBySwipeUp } from './helpers/phone';

test.describe('Lock screen @smoke', () => {
  test('shows no home bar, ignores a short swipe, and unlocks on a full swipe up', async ({ page }) => {
    const errors = collectErrors(page);
    await clearStorageOnFirstLoad(page);
    const lock = await openLevelToLockscreen(page);

    // The shell home bar (.phone-system-home) must not render while locked.
    await expect(lock).toBeVisible();
    await expect(page.locator('.phone-system-home')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Về trang chủ' })).toHaveCount(0);

    // A 40px swipe is below the unlock threshold.
    const vp = page.viewportSize();
    if (!vp) throw new Error('No viewport');
    const x = vp.width / 2;
    await touchSwipe(page, { x, y: vp.height - 20 }, { x, y: vp.height - 60 });
    await expect(lock).toBeVisible();

    await unlockBySwipeUp(page);
    await expect(page.locator('[data-launch-app="internet-messaging"]')).toBeVisible();
    await expect(page.locator('[data-launch-app="banking"]')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('unlocks on a touch swipe that starts mid-screen over a notification, and the home clock shows story time', async ({ page }) => {
    await clearStorageOnFirstLoad(page);
    const lock = await openLevelToLockscreen(page);
    const vp = page.viewportSize();
    if (!vp) throw new Error('No viewport');
    const x = vp.width / 2;
    await touchSwipe(page, { x, y: vp.height * 0.7 }, { x, y: vp.height * 0.7 - 260 });
    await expect(lock).toHaveCount(0);
    const clock = page.locator('.phone-clock-widget');
    await expect(clock).toContainText('23:4');
    await expect(clock).toContainText('15 tháng 10');
  });
});

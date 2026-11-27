import { expect, test } from '@playwright/test';
import {
  launchApp,
  startCleanPhone,
  swipeDownControlCenter,
  swipeRightBack,
  swipeUpHome,
} from './helpers/phone';

test.describe('Phone Shell @smoke', () => {
  test('renders home screen, launches dock app, and returns home via home bar and swipe-up', async ({ page }) => {
    const errors = await startCleanPhone(page);

    // Home screen clock and core launchers are visible
    await expect(page.locator('[data-launch-app="internet-messaging"]')).toBeVisible();
    await expect(page.locator('[data-launch-app="banking"]')).toBeVisible();
    await expect(page.locator('[data-launch-app="ecommerce"]')).toBeVisible();
    await expect(page.locator('[data-launch-app="photos"]')).toBeVisible();

    // Launch Zola and return via bottom home button
    await launchApp(page, 'internet-messaging');
    // The bottom home button only exists on the Android layout; iOS layout uses the swipe gesture only.
    if (test.info().project.name === 'android') {
      await page.getByRole('button', { name: 'Về trang chủ' }).click();
    } else {
      await expect(page.getByRole('button', { name: 'Về trang chủ' })).toHaveCount(0);
      await swipeUpHome(page);
    }
    await expect(page.locator('[data-app-surface]')).toBeHidden();

    // Launch Photos and return via upward swipe from home bar
    await launchApp(page, 'photos');
    await swipeUpHome(page);
    await expect(page.locator('[data-app-surface]')).toBeHidden();

    // Launch Comms (Phone) and return via swipe-right back from root
    await launchApp(page, 'phone');
    await swipeRightBack(page);
    await expect(page.locator('[data-app-surface]')).toBeHidden();

    expect(errors).toEqual([]);
  });

  test('opens Control Center and navigates to Level Selector sheet', async ({ page }) => {
    const errors = await startCleanPhone(page);

    // With the status bar hidden, the first pull-down only shows a chevron hint; the second opens the panel.
    const controlCenter = page.getByRole('dialog', { name: 'Trung tâm điều khiển' });
    await swipeDownControlCenter(page);
    if (!(await controlCenter.isVisible())) {
      await swipeDownControlCenter(page);
    }
    const levelsButton = controlCenter.getByRole('button', { name: 'Chọn màn chơi' });
    await expect(levelsButton).toBeVisible();
    await levelsButton.click();

    // Level selector now asks for confirmation before leaving the level.
    const confirm = page.getByRole('dialog', { name: 'Đổi màn chơi?' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Ở lại' }).click();
    await expect(confirm).toBeHidden();
    await expect(page.locator('.phone-shell')).toBeVisible();

    expect(errors).toEqual([]);
  });
});

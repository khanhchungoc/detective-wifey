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
    await page.getByRole('button', { name: 'Về trang chủ' }).click();
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

    await swipeDownControlCenter(page);

    await expect(page.getByRole('button', { name: 'Chọn màn chơi' })).toBeVisible();
    await page.getByRole('button', { name: 'Chọn màn chơi' }).click();

    await expect(page.getByText('HỒ SƠ VỤ ÁN & CHỌN MÀN CHƠI')).toBeVisible();
    await page.getByRole('button', { name: 'Đóng' }).click();
    await expect(page.getByText('HỒ SƠ VỤ ÁN & CHỌN MÀN CHƠI')).toBeHidden();

    expect(errors).toEqual([]);
  });
});

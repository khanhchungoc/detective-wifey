import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Attaches console/page error listeners and navigates to a clean Level 1 phone state.
 */
export async function startCleanPhone(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`console.error: ${msg.text()}`);
    }
  });

  await page.addInitScript(() => {
    window.localStorage.clear();
  });

  await page.goto('/');
  await expect(page.locator('.phone-shell')).toBeVisible();
  return errors;
}

/**
 * Opens an app from the home screen or dock by its appId (`data-launch-app`).
 */
export async function launchApp(page: Page, appId: string): Promise<void> {
  const launcher = page.locator(`[data-launch-app="${appId}"]`).first();
  await expect(launcher).toBeVisible();
  await launcher.click();
  await expect(page.locator('[data-app-viewport]')).toBeVisible();
}

/**
 * Triggers the 380ms universal long-press gesture on a StoryEvidenceTarget element
 * and waits for the UniversalEvidenceModal dialog to appear.
 */
export async function longPressToPinModal(page: Page, target: Locator): Promise<Locator> {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) {
    throw new Error('Cannot long-press element without a bounding box');
  }
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  await page.mouse.move(cx, cy);
  await page.mouse.down();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 2500 });
  await page.mouse.up();
  return dialog;
}

/**
 * Confirms pinning inside the open UniversalEvidenceModal.
 */
export async function confirmEvidencePin(dialog: Locator): Promise<void> {
  const pinBtn = dialog.getByRole('button', { name: 'Ghim', exact: true });
  await expect(pinBtn).toBeEnabled();
  await pinBtn.click();
  await expect(dialog).toBeHidden();
}

/**
 * Performs a horizontal swipe-right gesture across the active viewport to go back.
 */
export async function swipeRightBack(page: Page, startX = 40, y = 420, distance = 180): Promise<void> {
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(startX + distance, y, { steps: 10 });
  await page.mouse.up();
}

/**
 * Performs an upward swipe from the bottom home indicator zone to return Home.
 */
export async function swipeUpHome(page: Page): Promise<void> {
  const shell = await page.locator('.phone-shell').boundingBox();
  if (!shell) throw new Error('Phone shell not visible');
  const cx = shell.x + shell.width / 2;
  const startY = shell.y + shell.height - 14;
  await page.mouse.move(cx, startY);
  await page.mouse.down();
  await page.mouse.move(cx, startY - 140, { steps: 10 });
  await page.mouse.up();
}

/**
 * Pulls down from the top status bar trigger to open Control Center.
 */
export async function swipeDownControlCenter(page: Page): Promise<void> {
  const trigger = page.locator('[data-control-center-trigger]');
  await expect(trigger).toBeVisible();
  const box = await trigger.boundingBox();
  if (!box) throw new Error('Control center trigger has no bounding box');
  const cx = box.x + box.width / 2;
  const startY = box.y + Math.min(20, box.height / 2);
  await page.mouse.move(cx, startY);
  await page.mouse.down();
  await page.mouse.move(cx, startY + 120, { steps: 10 });
  await page.mouse.up();
}

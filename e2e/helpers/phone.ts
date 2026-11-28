import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Collects page errors and console errors so specs can assert a clean run.
 */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`console.error: ${msg.text()}`);
    }
  });
  return errors;
}

/**
 * Clears localStorage once per test (first load only), so later reloads keep saved progress.
 */
export async function clearStorageOnFirstLoad(page: Page): Promise<void> {
  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem('e2e:storage-cleared')) {
      window.localStorage.clear();
      window.sessionStorage.setItem('e2e:storage-cleared', '1');
    }
  });
}

/**
 * From the case file browser: open the active husband folder, flip to the level file and start it.
 */
export async function startCaseFromSelector(page: Page, caseId = 'case_01'): Promise<void> {
  await page.locator('[data-husband-id="husband_hoang"]').click();
  await page.locator(`[data-level-tab="${caseId}"]`).click();
  await page.locator(`[data-case-id="${caseId}"]`).click();
}

/**
 * Walks the real start flow up to the phone lock screen:
 * "Bắt đầu" -> open husband folder -> level file -> skip intro -> briefing "Bắt đầu điều tra".
 */
export async function openLevelToLockscreen(page: Page, caseId = 'case_01'): Promise<Locator> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Bắt đầu' }).click();
  await startCaseFromSelector(page, caseId);
  const skip = page.getByRole('button', { name: 'Bỏ qua' });
  const openPhone = page.getByRole('button', { name: /Bắt đầu điều tra/ });
  // The intro may be skipped on replays, and a "Bỏ qua" tap right after it mounts can be ignored,
  // so retry until the briefing's "Bắt đầu điều tra" button shows.
  await expect(async () => {
    if (await skip.isVisible()) await skip.click();
    await expect(openPhone).toBeVisible({ timeout: 1000 });
  }).toPass();
  await openPhone.click();
  const lock = page.locator('[data-phone-lockscreen]');
  await expect(lock).toBeVisible();
  return lock;
}

/**
 * Unlocks the lock screen with a real touch swipe up from the bottom edge.
 */
export async function unlockBySwipeUp(page: Page): Promise<void> {
  const vp = page.viewportSize();
  if (!vp) throw new Error('No viewport');
  await touchSwipe(page, { x: vp.width / 2, y: vp.height - 20 }, { x: vp.width / 2, y: vp.height - 320 });
  await expect(page.locator('[data-phone-lockscreen]')).toHaveCount(0);
}

/**
 * Clean storage, start Level 1 (or caseId), unlock, and land on the home screen.
 * Returns the collected error list.
 */
export async function startCleanPhone(page: Page, caseId = 'case_01'): Promise<string[]> {
  const errors = collectErrors(page);
  await clearStorageOnFirstLoad(page);
  await openLevelToLockscreen(page, caseId);
  await unlockBySwipeUp(page);
  await expect(page.locator('.phone-shell')).toBeVisible();
  return errors;
}

type Point = { x: number; y: number };

/**
 * Dispatches a real touch drag (touchStart -> touchMove x steps -> touchEnd) via CDP.
 * Use this instead of page.mouse for gestures, so touch-only bugs are caught.
 */
export async function touchSwipe(page: Page, from: Point, to: Point, steps = 12): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [from] });
  for (let i = 1; i <= steps; i++) {
    const x = from.x + ((to.x - from.x) * i) / steps;
    const y = from.y + ((to.y - from.y) * i) / steps;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

/**
 * Holds a real touch on a point, runs `whileHeld` (e.g. wait for a modal), then lifts the finger.
 */
export async function touchHold(page: Page, at: Point, whileHeld: () => Promise<void>): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [at] });
  try {
    await whileHeld();
  } finally {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await cdp.detach();
  }
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
 * Evidence targets of the app on screen. Other apps stay mounted but hidden, so always scope here.
 */
export function activeEvidence(page: Page): Locator {
  return page.locator('[data-app-instance]:not([hidden]) [data-evidence-target="true"]');
}

/**
 * Long-presses a story target with a real touch until the evidence dialog opens, optionally
 * inspects it, then pins it with "Ghim".
 * The finger lifts as a player would, so a release that dismisses the dialog fails the test.
 */
export async function longPressAndPin(
  page: Page,
  target: Locator,
  inspect?: (dialog: Locator) => Promise<void>,
): Promise<void> {
  // Centre the target so the touch cannot land in the home-indicator or tab-bar edge zones.
  await target.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  const box = await target.boundingBox();
  if (!box) throw new Error('Cannot long-press element without a bounding box');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const dialog = page.getByRole('dialog');
  await touchHold(page, { x, y }, async () => {
    await expect(dialog).toBeVisible({ timeout: 2500 });
  });
  if (inspect) await inspect(dialog);
  const pin = dialog.getByRole('button', { name: 'Ghim', exact: true });
  await expect(pin).toBeEnabled();
  await pin.click();
  await expect(dialog).toBeHidden();
}

/**
 * Performs a horizontal swipe-right gesture across the active viewport to go back.
 */
export async function swipeRightBack(page: Page, startX = 40, y = 420, distance = 180): Promise<void> {
  await touchSwipe(page, { x: startX, y }, { x: startX + distance, y });
}

/**
 * Performs an upward swipe from the bottom home indicator zone to return Home.
 */
export async function swipeUpHome(page: Page): Promise<void> {
  const shell = await page.locator('.phone-shell').boundingBox();
  if (!shell) throw new Error('Phone shell not visible');
  const cx = shell.x + shell.width / 2;
  const startY = shell.y + shell.height - 14;
  await touchSwipe(page, { x: cx, y: startY }, { x: cx, y: startY - 140 });
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
  await touchSwipe(page, { x: cx, y: startY }, { x: cx, y: startY + 120 });
}

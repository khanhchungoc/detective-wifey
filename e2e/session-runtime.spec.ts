import { expect, test, type Page } from '@playwright/test';
import {
  clearStorageOnFirstLoad,
  collectErrors,
  launchApp,
  longPressAndPin,
  startCaseFromSelector,
  startCleanPhone,
  unlockBySwipeUp,
} from './helpers/phone';

const SESSION_KEY = 'detective:v1:jealous_wife:session';

/**
 * Replays the start flow after a reload up to the unlocked home screen. The intro "Bỏ qua" tap is
 * retried because a tap right after the intro mounts can be ignored.
 */
async function replayStartFlow(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Bắt đầu' }).click();
  await startCaseFromSelector(page, 'case_01');
  const skip = page.getByRole('button', { name: 'Bỏ qua' });
  const openPhone = page.getByRole('button', { name: /Bắt đầu điều tra/ });
  await expect(async () => {
    if (await skip.isVisible()) await skip.click();
    await expect(openPhone).toBeVisible({ timeout: 1000 });
  }).toPass();
  await openPhone.click();
  await expect(page.locator('[data-phone-lockscreen]')).toBeVisible();
  await unlockBySwipeUp(page);
}

interface SavedSession {
  caseId: string;
  levelNumber: number;
  taggedSuspects: unknown[];
}

async function readSavedSession(page: Page): Promise<SavedSession | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as SavedSession) : null;
  }, SESSION_KEY);
}

test.describe('Session & Case Runtime @smoke', () => {
  test('saves a pinned clue and resumes the session after a reload', async ({ page }) => {
    const errors = await startCleanPhone(page);

    // Pin one clue (a call-log row) in Level 1 so an active session is saved.
    await launchApp(page, 'phone');
    const row = page
      .locator('[data-app-instance]:not([hidden]) [data-evidence-target="true"]')
      .filter({ hasText: 'Khoa BE' })
      .first();
    await longPressAndPin(page, row);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /1 manh mối/);

    // Wait for the save to land in localStorage.
    await expect.poll(async () => (await readSavedSession(page))?.taggedSuspects.length).toBe(1);
    expect((await readSavedSession(page))?.caseId).toBe('case_01');

    // Reload keeps storage (cleared only on the first load of the test) and shows Tiếp tục on the start screen.
    await page.reload();
    await page.getByRole('button', { name: /Tiếp tục/ }).click();

    // Lands directly in the ongoing game without an in-phone resume modal, with the clue still pinned.
    await expect(page.getByText('Tiếp Tục Điều Tra?')).toHaveCount(0);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /1 manh mối/);
    await page.locator('[data-notebook-tab]').click();
    await expect(page.locator('[aria-label^="Định vị bảng"]')).toHaveAttribute('aria-label', /1 manh mối/);

    expect(errors).toEqual([]);
  });

  test('offers Tiếp tục on a seeded session and starts fresh via Bắt đầu without an in-phone modal', async ({ page }) => {
    const errors = collectErrors(page);
    await clearStorageOnFirstLoad(page);

    // Seed a valid active Level 1 session before the app starts.
    await page.goto('/');
    await page.evaluate((key) => {
      const session = {
        schemaVersion: 1,
        gameId: 'jealous_wife',
        caseId: 'case_01',
        levelNumber: 1,
        activeApp: 'home',
        suspicionStrikes: 1,
        taggedSuspects: [
          {
            suspectId: 'tag_seed_1',
            displayName: 'Khoa BE',
            sourceApp: 'internet-messaging',
            timestamp: 1000,
          },
        ],
        unlockedChallenges: [],
        elapsedSeconds: 30,
        lastSavedAt: Date.now(),
      };
      window.localStorage.setItem(key, JSON.stringify(session));
    }, SESSION_KEY);
    await page.reload();

    await expect(page.getByRole('button', { name: /Tiếp tục/ })).toBeVisible();
    await replayStartFlow(page);

    // No in-phone resume modal appears; picking Level 1 starts fresh and clears the saved session.
    await expect(page.getByText('Tiếp Tục Điều Tra?')).toHaveCount(0);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /0 manh mối/);
    await expect.poll(() => readSavedSession(page)).toBeNull();

    expect(errors).toEqual([]);
  });

  test('gates locked levels in the case file browser with a warning banner', async ({ page }) => {
    const errors = collectErrors(page);
    await clearStorageOnFirstLoad(page);

    await page.goto('/');
    await page.getByRole('button', { name: 'Bắt đầu' }).click();
    await page.getByRole('button', { name: 'Mở hồ sơ' }).click();
    await page.locator('[data-level-tab="case_02"]').click();

    const locked = page.locator('[data-level-file="case_02"]');
    await expect(locked).toHaveAttribute('data-level-unlocked', 'false');
    // A locked file has no start button; tapping the file explains why.
    await expect(locked.locator('[data-case-id]')).toHaveCount(0);
    await locked.click();

    await expect(page.getByRole('alert')).toHaveText('Bạn cần vượt qua màn chơi trước để mở khóa màn này');
    // Still on the picker: no briefing or lock screen opened.
    await expect(page.getByRole('button', { name: /Bắt đầu điều tra/ })).toHaveCount(0);
    await expect(page.locator('[data-phone-lockscreen]')).toHaveCount(0);

    expect(errors).toEqual([]);
  });
});

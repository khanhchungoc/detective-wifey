import { expect, test, type Page } from '@playwright/test';
import {
  clearStorageOnFirstLoad,
  collectErrors,
  launchApp,
  longPressAndPin,
  startCleanPhone,
  unlockBySwipeUp,
} from './helpers/phone';

const SESSION_KEY = 'detective:v1:jealous_wife:session';

/**
 * Replays the start flow after a reload up to the unlocked home screen. The intro "Bỏ qua" tap is
 * retried because a tap right after the intro mounts can be ignored.
 */
async function replayStartFlow(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Chạm để bắt đầu' }).click();
  await page.locator('[data-case-id="case_01"]').click();
  const skip = page.getByRole('button', { name: 'Bỏ qua' });
  const openPhone = page.getByRole('button', { name: /Mở điện thoại/ });
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

    // Reload keeps storage (cleared only on the first load of the test) and replays the start flow.
    await page.reload();
    await replayStartFlow(page);

    // The app offers to resume the saved Level 1 session.
    await expect(page.getByText('Tiếp Tục Điều Tra?')).toBeVisible();
    await expect(page.getByText(/Màn 1 với 1 manh mối đã ghim/)).toBeVisible();
    await page.getByRole('button', { name: 'Tiếp tục điều tra' }).click();
    await expect(page.getByText('Tiếp Tục Điều Tra?')).toBeHidden();

    // Same level, clue still pinned.
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /1 manh mối/);
    await page.locator('[data-notebook-tab]').click();
    await expect(page.locator('[aria-label^="Định vị bảng"]')).toHaveAttribute('aria-label', /1 manh mối/);

    expect(errors).toEqual([]);
  });

  test('offers Resume on a seeded session and supports restarting the level', async ({ page }) => {
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

    await replayStartFlow(page);

    await expect(page.getByText('Tiếp Tục Điều Tra?')).toBeVisible();
    await expect(page.getByText(/1 manh mối đã ghim/)).toBeVisible();
    await page.getByRole('button', { name: 'Bắt đầu lại màn này' }).click();
    await expect(page.getByText('Tiếp Tục Điều Tra?')).toBeHidden();
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /0 manh mối/);

    // Restart clears the saved session.
    await expect.poll(() => readSavedSession(page)).toBeNull();

    expect(errors).toEqual([]);
  });

  test('gates locked levels in the level picker with a warning banner', async ({ page }) => {
    const errors = collectErrors(page);
    await clearStorageOnFirstLoad(page);

    await page.goto('/');
    await page.getByRole('button', { name: 'Chạm để bắt đầu' }).click();

    const locked = page.locator('[data-level-unlocked="false"]').first();
    await expect(locked).toBeVisible();
    await expect(locked).toHaveAttribute('aria-disabled', 'true');
    // aria-disabled (not the disabled attribute) keeps the card tappable so it can explain itself.
    await locked.click({ force: true });

    await expect(page.getByRole('alert')).toHaveText('Bạn cần vượt qua màn chơi trước để mở khóa màn này');
    // Still on the picker: no briefing or lock screen opened.
    await expect(page.getByRole('button', { name: /Mở điện thoại/ })).toHaveCount(0);
    await expect(page.locator('[data-phone-lockscreen]')).toHaveCount(0);

    expect(errors).toEqual([]);
  });
});

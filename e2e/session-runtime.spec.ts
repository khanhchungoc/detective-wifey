import { expect, test, type Page } from '@playwright/test';
import {
  clearStorageOnFirstLoad,
  collectErrors,
  launchApp,
  longPressAndPin,
  startCleanPhone,
  swipeDownControlCenter,
  unlockBySwipeUp,
} from './helpers/phone';

const SESSION_KEY = 'detective:v1:jealous_wife:session';

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

    // Going back to the start screen via Control Center immediately offers "Tiếp tục" without reloading.
    const controlCenter = page.getByRole('dialog', { name: 'Trung tâm điều khiển' });
    await swipeDownControlCenter(page);
    if (!(await controlCenter.isVisible())) {
      await swipeDownControlCenter(page);
    }
    await controlCenter.getByRole('button', { name: 'Màn hình chính' }).click();
    await expect(page.getByRole('button', { name: /Tiếp tục/ })).toBeVisible();
    await page.getByRole('button', { name: /Tiếp tục/ }).click();
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /1 manh mối/);

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

  test('offers Tiếp tục on a seeded session and resumes in-progress level directly into lockscreen from level selector', async ({ page }) => {
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
    await page.getByRole('button', { name: 'Bắt đầu' }).click();
    await page.locator('[data-husband-id="husband_hoang"]').click();
    await page.locator('[data-level-tab="case_01"]').click();

    const caseCta = page.locator('[data-case-id="case_01"]');
    await expect(caseCta).toContainText('Tiếp tục điều tra');
    await caseCta.click();

    // Skips briefing and dives straight into phone lockscreen with saved progress intact.
    await expect(page.locator('[data-phone-lockscreen]')).toBeVisible();
    await unlockBySwipeUp(page);
    await expect(page.getByText('Tiếp Tục Điều Tra?')).toHaveCount(0);
    await expect(page.locator('[data-notebook-tab]')).toHaveAttribute('aria-label', /1 manh mối/);

    expect(errors).toEqual([]);
  });

  test('shows later levels as coming soon in the case file browser', async ({ page }) => {
    const errors = collectErrors(page);
    await clearStorageOnFirstLoad(page);

    await page.goto('/');
    await page.getByRole('button', { name: 'Bắt đầu' }).click();
    await page.locator('[data-husband-id="husband_hoang"]').click();
    await page.locator('[data-level-tab="case_02"]').click();

    const comingSoon = page.locator('[data-level-file="case_02"]');
    await expect(comingSoon).toHaveAttribute('data-level-coming-soon', 'true');
    await expect(comingSoon).toContainText('Sắp ra mắt');
    // A coming-soon file has no start button and tapping it opens nothing.
    await expect(comingSoon.locator('[data-case-id]')).toHaveCount(0);
    await comingSoon.click();
    await expect(page.getByRole('button', { name: /Bắt đầu điều tra/ })).toHaveCount(0);
    await expect(page.locator('[data-phone-lockscreen]')).toHaveCount(0);

    expect(errors).toEqual([]);
  });
});

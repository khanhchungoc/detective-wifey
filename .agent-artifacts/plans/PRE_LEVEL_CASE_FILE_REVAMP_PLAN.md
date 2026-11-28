# Pre-Level Case File Revamp - Implementation Plan

Status: Approved by product owner on 2026-11-28. Implementation in progress on `feat/pre-level-case-file-revamp`.

## Why

A first-time-player review of the screens before the phone (title, level selector, intro, briefing, lockscreen) found:

- The selector reads like a settings list, not the intended detective case file browser. Swipe is not discoverable, has no depth, and text from two husbands overlaps mid-swipe.
- "Màn 0 · Tập điều tra" and "Màn 1" start the same Level 1 case. There is no real guide level.
- Persona notes and the wife profile appear on both the selector and the briefing, with conflicting wording.
- Swipe-up to unlock the lockscreen fails. Tapping the label is the only way in.
- The home-screen clock shows the real device time instead of the story time (23:45, Thursday 15/10).

## Scope decisions

| # | Decision |
|---|---|
| 1 | The old "Màn 0" entry was really Level 1. Remove the duplicate. Add a new, clearly different **Màn 0 guide file**. It is visible but not playable until the in-phone guide is built. |
| 2 | Goal, rules and "long-press to pin" teaching belong to the future Màn 0 in-phone guide. The briefing gets a provoking headline instead: "Bạn có đủ tỉnh táo để tìm ra bằng chứng?" |
| 3 | Fix the swipe-up unlock gesture. |
| 4 | Evidence-tab hints are deferred to the Màn 0 guide. No lockscreen tab. |
| 5 | Selector becomes a case file browser: husband folders with a prominent portrait and a light 3D drag. Choosing a folder opens it; levels are files inside, browsed by flipping. |
| 6 | Persona notes and the wife profile live in one place: the briefing (also reachable in-phone via recall). Data SSOT is `HusbandProfile`. |
| 7 | All in-phone clocks follow the story clock. |
| 8 | Confrontation (ĐỐI CHẤT) flow and evidence-board changes are out of scope. |

Also in scope (minor): husband #2 gets a redacted silhouette instead of a greyscale copy of husband #1; the wife's portrait shows when she speaks in the intro; the title tagline no longer collides with the hero art; long level titles wrap.

Out of scope: tutorials, rules text, pin toast position, evidence board, confrontation, new image assets.

## Interface contract (pinned before parallel work)

Implemented in the foundation commit by the integrating agent:

- `src/shared/contracts/game-flow.ts`
  - `LevelCardItem`: `isPractice`, `level0Status`, `recommended` removed. Added `isGuide?: boolean` and `comingSoon?: boolean`.
  - `HusbandProfile`: `wifeAnchor` removed. `personaTraits` and `wifeProfile` are the SSOT read by the briefing.
  - `CaseBriefingData`: `wifeAnchor`, `activeAppCount`, `allowedStrikes`, `lockModeLabel` removed. Added `hookQuestion: string`.
  - `IntroDialogueBeat`: added `speakerRole: 'husband' | 'wife'`.
  - `PhoneLockscreenConfig`: added `narrativeStartIso: string` (story clock SSOT).
  - `Level0Status` removed with its localStorage helpers (no playable guide yet; the guide work re-adds persistence).
- `src/features/game-flow/gameFlowData.ts`: guide card `case_00_guide` (levelNumber 0, `isGuide`, `comingSoon`), `buildCaseBriefing(caseConfig, levelTitle, husband)`, `formatNarrativeShortDate`.
- `src/bootstrap/GameRoot.tsx`: guide cards never start a case.

DOM hooks used by E2E (`e2e/helpers/phone.ts`):

- Husband stage: primary button with accessible name **"Mở hồ sơ"** opens the active husband folder. Folder root keeps `data-husband-id`.
- Level stage: each level file has a jump tab `data-level-tab="<caseId>"`. The visible file's primary button has `data-case-id="<caseId>"` and name **"Điều tra màn này"**. Back button name **"Đổi hồ sơ"**.
- Briefing keeps the **"Mở điện thoại"** button. Lockscreen keeps `data-phone-lockscreen`.

## Work slices

| Slice | Owner | Files |
|---|---|---|
| A. Case file selector | Worker A | `src/features/game-flow/LevelSelectorHub.tsx`, its test, new files under `src/features/game-flow/case-files/` |
| B. Title + intro + briefing | Worker B | `GameStartupScreen.tsx`, `LevelContextBriefing.tsx`, their tests |
| C. Phone unlock + story clock | Worker C | `src/shell/components/PhoneLockscreen.tsx`, `src/shell/PhoneShell.tsx`, `src/shell/components/StatusBar.tsx`, their tests |
| Integration | Main agent | contracts, `gameFlowData.ts`, `index.ts`, `GameRoot.tsx`, `e2e/`, docs |

### A. Case file selector

- Header reads "Hồ sơ vụ án".
- **Husband stage**: manila folder cards in a carousel. Large clipped portrait, case-code tab, status stamp ("ĐANG THEO DÕI" / "SẮP RA MẮT"), name, age and job, teaser quote. Neighbor folders peek at both edges, tilted back in 3D.
- The folder follows the finger during drag (rotateY tilt, transform and opacity only) and springs to the nearest folder. Text never overlaps.
- Coming-soon husband: redacted silhouette and blacked-out bars, no reuse of another portrait. "Mở hồ sơ" is disabled for it.
- **Level stage**: the folder opens (cover flip). Level files sit inside as stacked papers. Swipe or tap tabs to flip between files.
  - Case file: "Màn N", wrapping title, summary, stars, and the "Điều tra màn này" button.
  - Locked file: "KHÓA" stamp and lock hint.
  - Guide file (Màn 0): "HƯỚNG DẪN" stamp, the guide teaser, and a "Sắp có" state. No start button.
  - Opens on the highest unlocked case file, not Màn 0.
- Persona notes and the wife profile are removed from the selector.
- Reduced motion: no 3D, fades only. Touch targets at least 44x44px.

### B. Title + intro + briefing

- Title: the tagline no longer overlaps the hero art and stays legible.
- Intro: the portrait follows `speakerRole` (wife beats show `wifeProfile.portraitUrl`).
- Briefing order:
  1. `hookQuestion` as the headline
  2. "Nghi vấn" (`suspicionHook`)
  3. "Lời khai tối nay" (`statedAlibi`)
  4. Persona notes
  5. Wife profile
  6. Sticky "Mở điện thoại"
- Drop `wifeAnchor` fallbacks. No rules or tutorial text.

### C. Phone unlock + story clock

- Reproduce the swipe-up failure (Playwright touch and mouse drag) before fixing. Fix the root cause so a real upward swipe unlocks, while taps on notifications still open their app.
- The home widget and status bar show story time: start at `lockscreenConfig.narrativeStartIso` when the phone opens and advance with real elapsed minutes. No real device date anywhere in the phone.

## Verification

- Each slice: `npx vitest run <slice paths>`, `npx tsc -b`, `npm run lint`.
- Integration: update `e2e/helpers/phone.ts` and `e2e/session-runtime.spec.ts` for the two-stage selector. Run the lockscreen and session-runtime E2E specs, plus a phone-size screenshot pass over title, selector (both stages), intro, briefing and lockscreen.
- Full E2E suite and build run before any PR to `main`, per repo policy.

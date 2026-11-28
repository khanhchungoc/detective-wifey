# NetSurf Functioning Browser - Implementation Plan

Status: Draft for review (2026-11-28). Not implemented.

## Why

NetSurf (`src/apps/web-browser`) is enabled in Level 1 and now holds a clue (`hist_026`, `CLUE-BROW-05`, size chart viewed before the dress order), but the app is only a static history list:

| Gap | Today |
|---|---|
| Tap does nothing | Rows only support long-press pinning; a "Nhấn giữ" hint is shown instead. |
| Fake address bar | Fixed text `netsurf://history/today`, not an input. |
| Page text never shown | Every history row has `content`, but `readAppData` drops it. |
| Open tabs never shown | Level data has `tabs` (2), unused. |
| Clue identity lost when pinning | `readAppData` drops `clueRefId` and the evidence item has no `source`, so a pinned `CLUE-BROW-05` does not carry its clue or record id (other apps pass `source: { caseId, recordId, clueRefId }`). |
| Spec and data disagree | `features.md` contract names `searchHistory` / `openTabs`; real data uses `history` / `tabs`. |

## Goal

A browser that feels real inside the story world, using only the level's own pages. No real internet.

## Scope

In:
1. **Page view**: tap a history row or tab opens the page. Address bar shows its URL; body shows title and `content`. Back returns to the previous screen.
2. **Working address bar**: a text input. Enter searches the level's pages (history + tabs) by title, URL and content (accent-insensitive). One match opens it; several show a results list; none shows "Không tìm thấy trang". Typing an exact known URL opens that page.
3. **Tabs**: a toolbar button with the open-tab count opens a tab switcher listing `tabs`; tapping a tab opens its page.
4. **Pinning everywhere**: history rows, tab cards and the open page are `StoryEvidenceTarget`s and pass `source` (`caseId`, `recordId`, `clueRefId`) like other apps. Remove the "Nhấn giữ" hint.
5. **Navigation**: an in-app view stack (`history` / `page` / `tabs` / `results`); the app's existing back/home gesture behavior stays unchanged.

Out:
- Loading real websites (iframes): most sites refuse embedding, it breaks the story world, leaks real browsing, and real pages cannot be pinned.
- Incognito tabs, date grouping, rich HTML pages, images. These can follow when a level needs them (`CLUE-BROW-02` incognito booking is a Level 2-3 idea).
- New dependencies.

## Data contract

Keep the existing data keys (data is the SSOT); fix `features.md` to match.

```ts
interface WebPage {
  id: string;            // hist_NNN or tab_NNN (generic, name-free)
  title: string;
  url: string;           // fictional domains only, e.g. noidung.local, shopoo.local
  content: string;       // plain text; blank lines split paragraphs
  time?: string;         // history only, "dd/mm/yyyy HH:mm"
  timestamp?: string;
  clueRefId?: string;
}
interface WebBrowserData {
  history: WebPage[];
  tabs?: WebPage[];
}
```

- `src/apps/web-browser/data.ts` reads `content` and `clueRefId` (and `tabs`).
- Drop `suspectName` from the reader (no data uses it; identity labels in records are banned by the level rules).
- `src/data/defaults/web-browser.json` keeps working as filler (no clue ids).

## Files

| File | Change |
|---|---|
| `src/apps/web-browser/data.ts` | Read `content`, `clueRefId`, `tabs`; export `WebPage`; add `searchPages(pages, query)` (pure, accent-insensitive). |
| `src/apps/web-browser/WebBrowserApp.tsx` | View stack, address bar input, page view, tab switcher, results list; evidence `source` on every target. Split into `components/` only if the file passes ~250 lines. |
| `src/apps/web-browser/*.test.ts(x)` | Tests below. |
| `.agent-artifacts/project-knowledge-base/solution-context/apps/web-browser/features.md` | Data contract and features match the build. |
| `.agent-artifacts/project-knowledge-base/solution-context/apps/web-browser/app-design.md` | Note the implemented screens; mark incognito as future. |
| Level data | Optional: enrich `hist_026` content into a readable size table. No new clue. |

Reuse: `StoryEvidenceTarget`, `UniversalEvidenceModal`, `useMotionState`, brand tokens from `getAppBrand('web-browser')`, the shared slide navigation used by other apps (`SlideStackView`, added in PR #48) if it fits.

## Tests

- Unit: `searchPages` matches by title, URL and accented/unaccented content; exact URL wins; no match returns empty.
- Unit: data reader keeps `content`, `clueRefId`, `tabs`; tolerates missing `tabs`.
- Render: tapping a history row shows the page title, content and URL in the address bar; back returns to history.
- Render: evidence item for `hist_026` carries `source.clueRefId === 'CLUE-BROW-05'` and `source.recordId === 'hist_026'`.
- Render: tab count equals `tabs.length`; tab switcher opens a tab page.
- E2E (one spec, `@smoke`): open NetSurf, search "size", open the result, long-press pin, see it on the corkboard.

## Effort and risk

- Effort: small. One app module (~200 lines), one reader update, 5-6 unit tests, 1 E2E spec, 2 doc updates. No shared contract or other app changes.
- Risk: low. Only NetSurf changes. The pinned-evidence fix changes what the corkboard receives for browser pins; covered by the `source` test.
- Level 1 balance: the size-chart clue becomes easier to read once pages open. It stays optional (not a required edge).

## Order

1. Data reader + `searchPages` + unit tests.
2. Page view and back navigation; evidence `source` fix.
3. Address bar search and results.
4. Tab switcher.
5. Docs, E2E smoke spec, screenshot check on iPhone and Android sizes.

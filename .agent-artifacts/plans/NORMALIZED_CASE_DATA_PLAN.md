# Normalized Case Data (Master + Transactional) - Refactor Plan

Status: Draft for review (2026-11-28). Not implemented.

## Why

Renaming the husband from Hoàng to Thịnh touched 64 files. The cause is that the same facts live in many places:

| Problem | Where today | Effect |
|---|---|---|
| Husband identity split across 4 places | `meta.json` (`husbandName`), `gameFlowData.ts` (full name, age, job), `caseRuntime.ts` `LEVEL_CATALOG` (3 copies), `internet-messaging.json` `currentUser` | Easy to miss one. The rename missed `handle: hoang_tech88` and `avatarInitials: H`. |
| Names hard-coded as fallbacks in screens | `ConfrontationConfirmModal`, `confrontationEngine`, `confrontationScoring`, `useConfrontationFlow`, `WifeNotebookModal`, `InternetMessagingApp`, `MessagingProfileView`, `MessagingMyDocumentsView`, `MessagingChatThreadView`, `HusbandCharacterImage`, `LevelSelectorSheet` | A missing data field silently shows an old name instead of failing a test. |
| People copied by name into every app | Contact name repeated in messaging contacts, phone contacts, call log, SMS threads, toasts, timeline posts; husband name 38 times in `ecommerce.json` | One rename = find-and-replace across files. |
| Contact photo chosen by display name | `AVATAR_PROFILES` in `src/shared/ui/ContactAvatar.tsx` | Renaming a contact silently drops its photo. |
| Defaults carry the husband identity | `src/data/defaults/*.json` | A second husband would inherit Hoàng/Thịnh data. |

## ID policy: generic, name-free

Every ID is a neutral slot that any name can be plugged into. An ID never contains a person's name, nickname, role or story meaning.

| Rule | Why |
|---|---|
| IDs are type prefix + zero-padded number: `husband_01`, `person_001`, `org_001`, `contact_001`, `thread_001`, `call_001`, `tx_001`, `order_001`, `suspect_01`, `msg_001_0001` | Renaming a character changes one name field and nothing else. |
| No role in IDs (`person_mistress`, `suspect_culprit` are not allowed) | IDs can show up in devtools and saved state. A role in the ID would spoil the answer. Role lives in an author-only `role` field. |
| No name in IDs (`suspect_huong`, `thread_khoa`, `call_khoa_late`, `tx_lan_anh`, `husband_hoang` are migrated) | Today's IDs carry old names; renaming a person leaves misleading IDs behind. |
| Clue IDs keep their existing generic form (`CLUE-PHONE-01`) | Already name-free. |
| Folder and file names follow the same rule: `src/data/cases/husband_01/`, `stories/husband-01/` | The folder `hoang/` is itself a name. |
| Numbers are never reused after a record is deleted | Stops old saves or docs pointing at the wrong record. |

Readability for authors comes from tooling, not from IDs: `npm run case:preview` prints a level with IDs resolved to current names. No `_label` copy fields in data, since they go stale on rename.

## Target model

Split case data into **master data** (who and what exists) and **transactional data** (what happened). Transactional records point to master records by ID, never by name. Every ID is generic (see ID policy). A loader joins them at build time into the payload shapes the apps already read.

```
src/data/cases/husband_01/
  master/                     shared by every level of this husband
    husband.json              identity of the phone owner
    people.json               every real person in this universe
    orgs.json                 companies, shops, venues, banks
  level_01/
    meta.json                 level rules, ground truth, suspect pool (refs only)
    contacts.json             how the husband saved each person IN THIS LEVEL
    apps/*.json               transactional records (refs only)
    confrontation.json
    index.ts                  resolveLevel(master, level) -> CaseConfig
```

### Master data (per husband universe)

| File | Record | Key fields |
|---|---|---|
| `husband.json` | phone owner | `husbandId` (`husband_01`), `shortName` (Thịnh), `nickname` (Thịnh Doom), `fullName`, `fullNameAscii` (NGUYEN HUY THINH), `handle`, `initials`, `birthYear`, `occupation`, `phone`, `homeAddress`, `portraitAsset`, `comicAssetSet`, `wifePersonId` |
| `people.json` | person | `personId` (`person_001`), `legalName`, `gender`, `birthYear`, `role` (wife, family, friend, colleague, suspect, service), `orgId`, `phones[]`, `avatar` (sprite index or asset), `personaNotes` |
| `orgs.json` | company, shop, venue | `orgId` (`org_001`), `name`, `kind`, `address` |

Age is derived from `birthYear` and the story year, not stored.

### Level-scoped master: `contacts.json`

The game's core mechanic is the husband disguising people in his phone ("Khoa BE" is really Hương). That disguise changes per level (Level 2 theme is swapping contacts), so the saved name is level data, not person data.

| Field | Example |
|---|---|
| `contactId` | `contact_010` |
| `personId` | `person_014` |
| `savedName` | `Khoa BE` |
| `phone` | `0988886677` |
| `avatarOverride` | optional, for disguised contacts |

Avatar lookup moves from display name to `contactId` / `personId`. `AVATAR_PROFILES` is deleted.

### Transactional data (per level, refs only)

| App | Record | Replace name fields with |
|---|---|---|
| internet-messaging | thread, message, timeline post | `contactId` on 1-1 threads, `memberContactIds` on groups, `senderContactId` on group messages (already partly used), `authorContactId` on posts |
| phone | call | `contactId` only (drop `contactName`) |
| messages | SMS thread | `contactId` only (drop `senderTitle`) |
| ecommerce | order | `recipientPersonId` (drop `recipientName`, `suspectName`); `shopOrgId` |
| banking | transaction | `counterpartyPersonId` or `counterpartyOrgId` (drop free-text `beneficiary` where it is a person) |
| email, professional-network, team-collaboration | message, post | `senderPersonId` / `authorPersonId` |
| ride-hailing | trip | `pickupOrgId` / `dropoffOrgId` where it is a known place |
| meta.json | suspect | `personId` + `contactId`; `displayName` derived |

### Names inside free text

Chat bubbles, notes and roasts stay plain text. Turning prose into templates makes writing harder and gains little. Two narrow exceptions use tokens resolved at load time:

- Husband identity in system-style strings: `{{husband.fullNameAscii}}` in bank memos, `{{husband.shortName}}:` as the sender prefix in team-collaboration previews.
- Nothing else. Friends' names in prose stay literal. An unknown token fails the integrity test.

## Code changes

1. **Loader** `resolveLevel()` in `src/data/cases/shared/resolveLevel.ts`: joins master + contacts + transactional and outputs today's `CaseConfig` and app payload shapes. Apps keep reading `contactName`, `recipientName` and so on, so the 12 app modules do not change in this refactor.
2. **Husband identity in one place**: `CaseConfig.husband` (typed from `husband.json`) replaces `husbandName`. `LEVEL_CATALOG` and `buildHusbandProfiles()` are generated from master data, not hand-written.
3. **Remove hard-coded fallbacks**: every `|| 'Hoàng'` / default prop with a name is deleted. Components take identity from `caseConfig.husband`. Missing data becomes a type error or failing test.
4. **Defaults neutral**: `src/data/defaults/*.json` drop husband identity; the loader fills it from master.
5. **Types**: add `HusbandMaster`, `Person`, `Org`, `LevelContact` to `src/shared/contracts/case-schema.ts`.

## Guard rails (tests)

- **Snapshot parity**: before any move, snapshot the assembled `level01` payload. Each phase must reproduce it exactly, except deliberate fixes listed in that phase.
- **Referential integrity**: every `contactId`, `personId`, `orgId` resolves; every suspect resolves to a person; no orphan contacts.
- **No hard-coded identity**: a test greps `src/` (excluding `src/data/cases/*/master/`) for the husband's names and fails on any match.
- **Token check**: every `{{...}}` resolves.

## Save-game safety

Saved sessions and pinned evidence store `caseId`, `husbandId`, `suspectId` and record IDs. Migrating name-based IDs to generic IDs changes some of them, so:

- Bump `SCHEMA_VERSION` in `src/features/session/localStorageAdapter.ts` from 1 to 2 in the same PR as the ID migration. Old saves are ignored and players start the case fresh. Acceptable while the game is pre-release.
- Alternative (not recommended now): ship an old-to-new ID map and rewrite saved state on load. Only worth it once real players have long-running saves.
- The migration is done by a one-off script with an explicit old-to-new ID map (`scripts/migrate-generic-ids.mjs`). It rewrites data JSON, tests, e2e specs, `requiredEdgeIds` in `confrontation.json` and story docs in one pass, then is deleted. The map is committed in the PR description for review.

## Phases

| Phase | Scope | Visible change |
|---|---|---|
| 0 | Fix leftover `hoang_tech88` / `H`. Add snapshot parity test. | Chat profile shows Thịnh's handle and initial. |
| 1 | Generic ID migration: run `migrate-generic-ids` over data, tests, e2e, docs; rename folders `cases/hoang` to `cases/husband_01` and `stories/husband-hoang` to `stories/husband-01`; bump storage schema to v2. Snapshot updated once, IDs only. | Old local saves reset. |
| 2 | `husband.json` + `CaseConfig.husband`; generate `LEVEL_CATALOG` and husband profiles; remove all hard-coded fallbacks; neutral defaults; no-hard-coded-identity test. | None. |
| 3 | `people.json`, `orgs.json`, level `contacts.json`; phone, messages, messaging contacts and threads switch to `contactId`; avatar by ID; integrity test; `case:preview` script. | None. |
| 4 | Remaining apps: ecommerce, banking, email, posts, team-collaboration, ride-hailing; tokens for the two allowed cases. | None. |
| 5 | Migrate placeholder `level_02.json` / `level_03.json` to the same layout when they are authored. Update `level-designer` skill references, `husband-profile.md` and `friend-aliases.md` to point at master IDs. | None. |

Each phase is one PR to `stg`, passing unit tests and the snapshot.

## Trade-offs

| Choice | Recommended | Alternative | Why |
|---|---|---|---|
| Where to join data | Join at load time, apps unchanged | Apps look up IDs at runtime | Load-time join keeps the 12 apps untouched and the change reversible. Runtime lookup spreads the change across every app for no player benefit. |
| ID style | Generic numbered IDs (`person_014`) | Readable name slugs (`p_huong`) | Any name can be plugged in; no spoilers; no stale IDs after rename. Cost: raw JSON is less readable, covered by `case:preview`. |
| Existing name-based IDs | Migrate once, reset saves (schema v2) | Keep forever, or migrate saves with an ID map | Pre-release, a reset is cheap; a save migrator is extra code to maintain. |
| Prose names | Plain text | Full templating | Writing stays natural; renaming a friend in prose is rare and search-replace is fine. |

Cost to watch: authors editing raw JSON see `contact_010` instead of "Khoa BE". Mitigation: `npm run case:preview` prints the resolved level as a readable table, and story docs list each slot's ID next to its current name.

## Out of scope

Rewriting chat content, new levels, UI changes, story docs restructuring beyond adding master IDs.

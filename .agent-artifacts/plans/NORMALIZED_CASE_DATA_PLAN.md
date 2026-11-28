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

## Target model

Split case data into **master data** (who and what exists) and **transactional data** (what happened). Transactional records point to master records by ID, never by name. A loader joins them at build time into the payload shapes the apps already read.

```
src/data/cases/<husband>/
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
| `husband.json` | phone owner | `husbandId`, `shortName` (Thịnh), `nickname` (Thịnh Doom), `fullName`, `fullNameAscii` (NGUYEN HUY THINH), `handle`, `initials`, `birthYear`, `occupation`, `phone`, `homeAddress`, `portraitAsset`, `comicAssetSet`, `wifePersonId` |
| `people.json` | person | `personId` (readable slug: `p_huong`, `p_tuan_cho`, `p_mom`), `legalName`, `gender`, `birthYear`, `role` (wife, family, friend, colleague, suspect, service), `orgId`, `phones[]`, `avatar` (sprite index or asset), `personaNotes` |
| `orgs.json` | company, shop, venue | `orgId` (`o_technosoft`, `o_com_nieu_pho_co`), `name`, `kind`, `address` |

Age is derived from `birthYear` and the story year, not stored.

### Level-scoped master: `contacts.json`

The game's core mechanic is the husband disguising people in his phone ("Khoa BE" is really Hương). That disguise changes per level (Level 2 theme is swapping contacts), so the saved name is level data, not person data.

| Field | Example |
|---|---|
| `contactId` | `contact_10` (keep existing IDs) |
| `personId` | `p_huong` |
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

Saved progress and pinned evidence key on `caseId`, `husbandId`, thread IDs, order IDs and contact IDs. The plan keeps every existing record ID (`contact_10`, `thread_khoa`, `order_01`, `husband_hoang`). New IDs (`personId`, `orgId`) are added beside them, so existing saves keep working. No storage schema bump.

## Phases

| Phase | Scope | Visible change |
|---|---|---|
| 0 | Fix leftover `hoang_tech88` / `H`. Add snapshot parity test. | Chat profile shows Thịnh's handle and initial. |
| 1 | `husband.json` + `CaseConfig.husband`; generate `LEVEL_CATALOG` and husband profiles; remove all hard-coded fallbacks; neutral defaults; no-hard-coded-identity test. | None. |
| 2 | `people.json`, `orgs.json`, level `contacts.json`; phone, messages, messaging contacts and threads switch to `contactId`; avatar by ID; integrity test. | None. |
| 3 | Remaining apps: ecommerce, banking, email, posts, team-collaboration, ride-hailing; tokens for the two allowed cases. | None. |
| 4 | Migrate placeholder `level_02.json` / `level_03.json` to the same layout when they are authored. Update `level-designer` skill references and `husband-profile.md` to point at master IDs. | None. |

Each phase is one PR to `stg`, passing unit tests and the snapshot.

## Trade-offs

| Choice | Recommended | Alternative | Why |
|---|---|---|---|
| Where to join data | Join at load time, apps unchanged | Apps look up IDs at runtime | Load-time join keeps the 12 apps untouched and the change reversible. Runtime lookup spreads the change across every app for no player benefit. |
| ID style | Readable slugs for new IDs (`p_huong`) | Numeric (`person_7`) | Raw JSON stays readable for story authors. |
| Existing IDs | Keep as is | Rename to slugs | Renaming breaks saved games and evidence pins. |
| Prose names | Plain text | Full templating | Writing stays natural; renaming a friend in prose is rare and search-replace is fine. |

Cost to watch: authors editing raw JSON now see `contact_10` instead of "Khoa BE" in a call record. Mitigation: readable slugs for new IDs and a small script `npm run case:preview` that prints the resolved level as a readable table.

## Out of scope

Rewriting chat content, new levels, storage schema changes, UI changes, story docs restructuring beyond adding master IDs.

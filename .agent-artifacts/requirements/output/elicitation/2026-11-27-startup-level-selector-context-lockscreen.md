---
status: signed-off
artifact_type: elicitation_session
elicitation_status: COMPLETE
created_at: "2026-11-27T15:56:00+07:00"
updated_at: "2026-11-27T15:56:00+07:00"
topic: "startup-level-selector-context-lockscreen"
---

# Detective App Startup, Level Selector, Level Context & Persona, and iOS 27 Lockscreen - Elicitation Session

## Purpose & Scope

### Objective
Define an authoritative, cohesive entry flow for *Bắt được Tiểu tam* (Jealous Wife Detective Game) from initial web app startup through husband/level selection, narrative context and persona briefing, and an iOS 27-style phone shell lockscreen before entering the husband's home screen. Replace deprecated AssistiveTouch navigation with an iOS-style Notification Dropdown inside the phone shell.

### Boundary
| Area | Current Position | Status |
|---|---|---|
| MVP | Startup Boot Screen -> Level Selector Hub (with swipeable Husband carousel and Level 0-3 cards) -> Level Context & Persona (skippable 2-3 tap intro dialogue + Case Briefing card) -> iOS 27 Phone Shell Lockscreen (hybrid unlock: FaceID/swipe on L0-1, optional passcode on L2-3) -> Phone Home Screen. Notification Dropdown provides mid-case access to Level Selector and Case Context. | Confirmed |
| In Scope | `US-035` (App Startup & Entry Routing), `US-036` (Husband Carousel & Level Selector Hub), `US-037` (Level Context, Persona & Interactive Intro Briefing), `US-038` (iOS 27 Phone Shell Lockscreen & Hybrid Unlock), Notification Dropdown mid-case shortcuts, and updating/removing overlapping draft story routing (`US-023` removed; `US-025`, `US-002`, `US-031` aligned). | Confirmed |
| Out of Scope | AssistiveTouch floating menu (explicitly deprecated), cloud save / user accounts, video cutscenes, audio voice acting, and custom player wallpaper uploads. | Confirmed |

## PACT Baseline

### People
| Persona / Role | Commercial Model | Demographics & Literacy | Devices & Hardware | Ergonomics & Preferences | Accessibility & Constraints | Jobs To Be Done (JTBD) & Pain Points | Status |
|---|---|---|---|---|---|---|---|
| Vietnamese Gen Z / Gen Alpha Player (Age 13+) | B2C, 100% Free | Vietnamese-speaking casual mobile gamers; high smartphone OS familiarity | Mobile portrait browsers (iOS Safari 15+, Android Chrome 10+) and centered mobile frame on desktop | Fast, tactile iOS-like transitions; zero text fatigue; skippable intros on replay | Minimum 44x44px touch targets; WCAG AA contrast; `prefers-reduced-motion` static fallbacks | Jump into comedic detective cases quickly, understand the husband's cover story and wife's suspicion at a glance, feel the tension of unlocking the husband's phone | Confirmed |

### Activities
- Launch game, wait for asset preload, tap to unlock browser audio and enter the Level Selector Hub.
- Swipe left/right to browse husbands (viewing portrait and profile teaser) and pick a level (Level 0 practice or Level 1-3).
- Tap through a 2-3 beat comedic intro dialogue (or tap `"Bỏ qua"` to skip), read the Husband Persona & Case Context card, and tap `"Bắt đầu điều tra"`.
- View the husband's iOS 27 lockscreen with suspicious notifications and unlock via playful FaceID/swipe (L0-1) or optional passcode challenge (L2-3).
- Pull down the Notification Dropdown mid-case to re-read Case Context/Persona or switch levels (with confirmation warning).

### Context
- 100% client-side mobile-first web application; zero backend or PII storage.
- Satirical Vietnamese domestic detective theme with safe comedic tone.

### Technologies
- Existing client-side browser game and emulated iOS 27 virtual phone shell (375px-430px portrait viewport).
- Declarative case/husband schemas (`CaseConfig`, husband profile data) and `localStorage` for progression, stars, and Level 0 status.
- Shared strike/lockout engine for Level 2-3 lockscreen passcode failures.

## Rules & Data

### Rules
| Status | Rule |
|---|---|
| Confirmed | Startup screen requires an explicit tap (`"CHẠM ĐỂ BẮT ĐẦU"`) after preloading to unlock Web Audio, then routes directly to the Level Selector Hub (not directly to the phone home screen). |
| Confirmed | Level Selector Hub groups levels under a horizontal left/right swipeable Husband carousel displaying the husband's portrait picture from profile/case data. |
| Confirmed | Level 0 displays a `"Đề xuất"` badge for first-time players and tracks `"Chưa học"`, `"Đã bỏ qua"`, and `"Đã hoàn thành"` statuses; Level 1 is unlocked by default; Level 2-3 require passing the prior level. |
| Confirmed | AssistiveTouch is deprecated and removed. Mid-case access to Level Selector and Case Context lives in the phone shell's top-down Notification Dropdown. |
| Confirmed | Choosing Level Selector from the Notification Dropdown mid-case prompts a confirmation dialog warning that unsubmitted progress in the current level will be lost. |
| Confirmed | Level Context & Persona combines a 2-3 tap comedic intro dialogue (skippable via `"Bỏ qua"`) with a Case Briefing card (husband portrait, name, job, alibi, wife's suspicion hook, difficulty/active app count). |
| Confirmed | The Case Briefing / Persona card is re-openable anytime mid-case from the Notification Dropdown or Wife's Notebook without replaying the intro dialogue. |
| Confirmed | The iOS 27 Phone Lockscreen appears after the Level Context screen, showing husband wallpaper, narrative clock/date, and 1-2 privacy-masked notification stacks (iOS "Show Previews: When Unlocked" style). Lockscreen notifications must never reveal suspect names, disguise aliases, or smoking-gun message text. |
| Confirmed | Lockscreen unlock is hybrid by level: Level 0 and Level 1 use a playful FaceID / swipe-up unlock with zero strike penalty; Level 2 and Level 3 support an optional 4-digit passcode challenge where wrong PINs add +1 suspicion strike via the shared strike/lockout engine. |

### Data
| Area | Detail | Status |
|---|---|---|
| Inputs / Outputs | Husband catalog (id, name, portrait image, job, teaser bio), level list (level number, title, active app count, strike limit, lockscreen config, lockscreen preview notifications, intro dialogue beats, briefing hook), local progress (unlocked levels, best stars, Level 0 status). | Confirmed |
| Source of Truth | Declarative case and husband schemas (`US-001`) for static content; browser `localStorage` (`US-018`) for unlock state, stars, and tutorial status. | Confirmed |
| Lifecycle / Audit | Active run clues are session-scoped and discarded upon confirmed level switch from the Notification Dropdown; unlocked levels and best stars persist locally. | Confirmed |

## Decisions & Constraints

| Type | Item | Rationale / Impact | Owner / Status |
|---|---|---|---|
| Decision | Slice the flow into 4 focused stories (`US-035` to `US-038`) under Epic 01. | Keeps each screen/subsystem independently testable and within 1-week delivery sizing. | User / Confirmed |
| Decision | Deprecate and remove AssistiveTouch (`US-023`); move mid-case shortcuts to the Notification Dropdown. | Existing AssistiveTouch story is out of date; Notification Dropdown matches native iOS phone shell ergonomics. | User / Confirmed |
| Decision | Update overlapping draft stories (`US-025`, `US-002`, `US-031`) to align with the new authoritative flow. | Eliminates conflicting boot routing and stale AssistiveTouch references; `US-025` retains 3rd-party parody app splash screens. | User / Confirmed |
| Dependency | Husband portrait assets and level intro dialogue / lockscreen notification data in declarative case schemas (`US-001`, `US-027`, `US-034`). | Case data files must supply portrait path, intro beats, briefing copy, and lockscreen preview items. | Confirmed |

## Open Questions (Parking Lot)

| ID | Area | Question | Needed From | Status / Notes |
|---|---|---|---|---|
| - | - | None. All material flow, unlock, gating, and deprecation decisions confirmed by user. | - | Closed |

## Referenced Documents

- [Vision & Scope](../vision-scope.md)
- [Functional Decomposition](../functional-decomposition.md)
- [Epic 01: Virtual Phone Shell & MVP Parody App Suite](../epic-01-virtual-phone-app-ecosystem/epic.md)
- [US-002: Virtual Phone Shell Container & Level-Based App Grid](../epic-01-virtual-phone-app-ecosystem/us-002-virtual-phone-shell-container-8-app-home-grid.md)
- [US-025: Game Boot Title Screen & Parody Virtual App Launch Splash Screens](../epic-01-virtual-phone-app-ecosystem/us-025-game-boot-title-screen-parody-virtual-app-launch-splash-screens.md)
- [US-031: Level 0 Entry, Skip & Replay](../epic-01-virtual-phone-app-ecosystem/us-031-level-0-entry-skip-replay.md)
- [Phone OS Master Design](../../project-knowledge-base/solution-context/apps/phone-os/app-design.md)
- [Phone OS Shell Features](../../project-knowledge-base/solution-context/apps/phone-os/shell/features.md)

## Next Step
Proceed to Phase 1: update `functional-decomposition.md` and `epic-01-virtual-phone-app-ecosystem/epic.md`, author the combined ASCII wireframe (`wireframe-startup-level-flow-lockscreen.md`), obtain explicit user signoff on the ASCII wireframe (Phase 2), and then author `US-035` through `US-038` while updating overlapping routing in `US-025`, `US-002`, and `US-031` (Phase 3).

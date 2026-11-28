---
type: Requirement Story
epic: "Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)"
status: draft
description: "Full-screen Level Selector Hub with left/right swipeable Husband portrait carousel, vertical Level 0-3 cards with star ratings and lock gating, and mid-case access from the phone Notification Dropdown."
tags: [requirement, user-story, level-selector, husband-carousel, progression, notification-dropdown]
timestamp: "2026-11-27"
---

# US-036 - Husband Carousel & Level Selector Hub

### Epic: [Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)](./epic.md)

As a **Player**, I want to browse husbands in a left/right swipeable carousel showing each husband's picture, select unlocked levels with star progress, and reopen the Level Selector mid-case from the phone's Notification Dropdown.

---

### Canonical Wireframe Reference

- **ASCII Wireframe (Screen SSOT)**: [Startup, Level Selector Hub, Case Context & iOS 27 Lockscreen Flow (Screens 2 & 5)](./wireframes/wireframe-startup-level-flow-lockscreen.md)
- **Parent Design System**: [Game App Design System (Cold War Darkroom & Detective Dossier)](../../../project-knowledge-base/solution-context/design-system/game-design-system.md)

---

### Acceptance Criteria

#### AC01: Swipeable Husband Carousel with Portrait Display
1. The Level Selector Hub displays a horizontal swipeable carousel of husbands sourced from declarative case/husband profile data.
2. Each husband slide renders the husband's portrait picture from the case profile file, full display name, age/occupation, and a short comedic excuse teaser.
3. Players can switch between husbands via left/right touch swipe gestures as well as accessible previous (`[ < ]`) and next (`[ > ]`) buttons with pagination dots indicating the active husband.
4. Any unreleased future husband slot displays a clearly marked locked *"Sắp ra mắt"* card state and does not launch gameplay.

#### AC02: Level Cards, Level 0 Recommendation & Progression Gating
1. Below the active husband slide, the hub renders vertical Level cards scoped to that husband (Level 0 Practice and Levels 1-3).
2. For first-time players who have not started, skipped, or completed Level 0, the Level 0 card displays a *"Đề xuất"* badge. Level 0 always displays its current local status: *"Chưa học"*, *"Đã bỏ qua"*, or *"Đã hoàn thành"*.
3. Level 1 is unlocked by default even if Level 0 has not been played. Levels 2 and 3 remain locked with a lock icon and prerequisite label (*"Vượt qua Màn X để mở khóa"*) until the preceding level is passed.
4. Unlocked levels display earned best star ratings (0-3 stars), active app count, and strike limit.
5. Tapping a locked level blocks entry and shows an inline feedback banner: *"Bạn cần vượt qua màn chơi trước để mở khóa màn này!"*.

#### AC03: Routing to Level Context & Persona
1. Tapping any unlocked Level card loads that level's declarative configuration and transitions to the **Level Context & Persona** screen (`US-037`).
2. Rapid repeated taps on a level card are ignored while the transition is in progress.

#### AC04: Mid-Case Access via Notification Dropdown & Confirmation
1. During an active investigation inside the virtual phone shell, players can pull down the top **Notification Dropdown** (`US-038`) and tap *"Chọn màn"* to return to the Level Selector Hub. (AssistiveTouch is deprecated and not used.)
2. Tapping *"Chọn màn"* during an active, unsubmitted investigation displays a confirmation modal: *"Đổi màn chơi? Tiến độ chưa đối chất của màn hiện tại sẽ mất."* with *"Ở lại"* and *"Đổi màn chơi"* actions.
3. Selecting *"Ở lại"* closes the modal and preserves the active investigation; selecting *"Đổi màn chơi"* clears unsubmitted session clues and navigates to the Level Selector Hub while preserving saved unlocks, best stars, and tutorial status in `localStorage`.

#### AC05: Accessibility & Reduced Motion
1. Carousel arrows, level cards, and confirmation modal buttons all meet the >= 44x44px touch target minimum.
2. Under `prefers-reduced-motion: reduce`, husband slide changes and hub transitions render without spring/slide animations.

---

### Out of Scope

- AssistiveTouch floating menu (explicitly deprecated; `US-023` removed).
- Cloud progression sync, user accounts, or mid-level checkpoint saving across level switches.

---

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Persistence | Reads unlocked levels, best star ratings, and Level 0 status from browser `localStorage` with zero server requests. |
| Responsiveness | Smooth portrait layout across 375px-430px viewports with vertical scrolling for the level list and zero horizontal overflow. |

---

### Dependencies

- [Case & Content Schema Engine (US-001)](./us-001-declarative-case-content-schema-engine.md)
- [Level Progression Gating & Local Storage (US-018)](../functional-decomposition.md)
- [Level 0 Tutorial: Bữa cà phê tăng ca (US-034)](../epic-04-detective-case-stories-level-content/us-034-level-0-tutorial.md)
- [Detective App Startup & Entry Routing (US-035)](./us-035-detective-app-startup-entry-routing.md)

---

### Open Questions

None.

---

### Citations

- [Signed-off Elicitation Session](../elicitation/2026-11-27-startup-level-selector-context-lockscreen.md)
- [Signed-off ASCII Wireframe](./wireframes/wireframe-startup-level-flow-lockscreen.md)

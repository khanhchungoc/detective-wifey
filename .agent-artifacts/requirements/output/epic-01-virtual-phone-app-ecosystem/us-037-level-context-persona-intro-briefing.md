---
type: Requirement Story
epic: "Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)"
status: draft
description: "Combined pre-level narrative briefing screen featuring a skippable 2-3 tap comedic intro dialogue, a Husband Persona & Case Context card, and read-only mid-case recall from the Notification Dropdown or Wife's Notebook."
tags: [requirement, user-story, level-context, persona, intro-dialogue, briefing]
timestamp: "2026-11-27"
---

# US-037 - Level Context, Husband Persona & Interactive Intro Briefing

### Epic: [Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)](./epic.md)

As a **Player**, I want to play through a short skippable comedic intro dialogue and review the Husband Persona and Case Context briefing before entering the phone, and reopen the briefing card anytime during the investigation.

---

### Canonical Wireframe Reference

- **ASCII Wireframe (Screen SSOT)**: [Startup, Level Selector Hub, Case Context & iOS 27 Lockscreen Flow (Screens 3 & 5)](./wireframes/wireframe-startup-level-flow-lockscreen.md)
- **Parent Application Design**: [Phone OS Master Design](../../../project-knowledge-base/solution-context/apps/phone-os/app-design.md)

---

### Acceptance Criteria

#### AC01: Skippable 2-3 Tap Comedic Intro Dialogue
1. Selecting an unlocked level from the Level Selector Hub (`US-036`) opens the **Interactive Intro Dialogue** (2-3 sequential beats) showing the husband's portrait, expression state, timestamp/location label, and comedic excuse before falling asleep.
2. Tapping the dialogue card advances to the next beat; completing the final beat transitions smoothly to the **Case Briefing & Husband Persona Card**.
3. A persistent *"Bỏ qua >>"* button in the header lets the player skip remaining dialogue beats immediately and jump straight to the Case Briefing card.
4. A *"< Chọn màn"* back button returns the player to the Level Selector Hub without starting the case.

#### AC02: Husband Persona & Case Context Briefing Card
1. The Case Briefing card displays declarative case metadata without spoiling suspects or smoking-gun clues:
   - Husband portrait, full name, occupation, and stated alibi/cover story.
   - Wife's suspicion hook explaining the late-night context in 2-3 short lines.
   - Level parameters: active app count, suspicion strike limit, and lockscreen unlock mode (e.g., *"FaceID / Vuốt mở"* vs *"Mật khẩu màn hình"*).
2. Tapping the primary CTA *"BẮT ĐẦU ĐIỀU TRA"* initializes the level session and transitions directly to the **iOS 27 Phone Shell Lockscreen** (`US-038`).

#### AC03: Mid-Case Read-Only Recall
1. During an active investigation, the player can reopen the Case Briefing & Husband Persona card at any time from the phone's **Notification Dropdown** (*"Hồ sơ vụ án"*) or from the **Wife's Detective Notebook**.
2. Opening the briefing mid-case displays the Case Briefing card directly as a read-only overlay with a *"Đóng"* button, without replaying the intro dialogue and without resetting any collected clues or notebook links.

#### AC04: Accessibility & Reduced Motion
1. All interactive controls (*"< Chọn màn"*, *"Bỏ qua >>"*, dialogue tap area, *"BẮT ĐẦU ĐIỀU TRA"*, *"Đóng"*) meet the >= 44x44px touch target standard and WCAG AA text contrast.
2. Under `prefers-reduced-motion: reduce`, dialogue beats and briefing card transitions appear immediately without slide or bounce animations.

---

### Out of Scope

- Multi-branch dialogue trees or player dialogue choices during the intro (confrontation choices are owned by `US-016`).
- Voice acting or video cutscenes.

---

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Data-Driven Content | All intro dialogue beats, husband persona fields, and suspicion hook copy load declaratively from the level's case JSON/TypeScript config (`US-001`). |
| Zero Spoiler Policy | Briefing copy must never name the disguised culprit alias or reveal smoking-gun evidence items. |

---

### Dependencies

- [Case & Content Schema Engine (US-001)](./us-001-declarative-case-content-schema-engine.md)
- [Husband Carousel & Level Selector Hub (US-036)](./us-036-husband-carousel-level-selector-hub.md)
- [iOS 27 Phone Shell Lockscreen & Hybrid Unlock (US-038)](./us-038-ios27-phone-shell-lockscreen-hybrid-unlock.md)

---

### Open Questions

None.

---

### Citations

- [Signed-off Elicitation Session](../elicitation/2026-11-27-startup-level-selector-context-lockscreen.md)
- [Signed-off ASCII Wireframe](./wireframes/wireframe-startup-level-flow-lockscreen.md)

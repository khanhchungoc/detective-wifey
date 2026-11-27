---
type: Requirement Story
epic: "Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)"
status: draft
description: "Fullscreen detective game startup screen with asset preloader, explicit tap-to-start Web Audio unlock, and entry routing into the Level Selector Hub."
tags: [requirement, user-story, startup, boot-screen, audio-unlock, routing]
timestamp: "2026-11-27"
---

# US-035 - Detective App Startup & Entry Routing

### Epic: [Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)](./epic.md)

As a **Player**, I want to see the detective game startup screen while assets preload, tap to unlock audio, and enter the Level Selector Hub.

---

### Canonical Wireframe Reference

- **ASCII Wireframe (Screen SSOT)**: [Startup, Level Selector Hub, Case Context & iOS 27 Lockscreen Flow (Screen 1)](./wireframes/wireframe-startup-level-flow-lockscreen.md)
- **Parent Design System**: [Game App Design System (Cold War Darkroom & Detective Dossier)](../../../project-knowledge-base/solution-context/design-system/game-design-system.md)

---

### Acceptance Criteria

#### AC01: Startup Title Display & Asset Preloading
1. Opening the web application renders the fullscreen Startup Screen displaying the game emblem, title (*"VỢ BẮT GIAN - BẮT ĐƯỢC TIỂU TAM"*), subtitle (*"Chồng vừa ngủ say... Đã đến lúc điều tra!"*), and version label.
2. While initial game assets (portraits, app icon sprites, audio clips) load, a progress bar advances smoothly from 0% to 100% accompanied by the status text *"Đang tải hồ sơ vụ án..."*.
3. Under cached or local conditions, preloading completes within 1.5 seconds without layout shifts.

#### AC02: Explicit Tap-to-Start & Web Audio Unlock
1. Once asset preloading reaches 100%, the loading indicator transitions into an interactive button/prompt labeled *"CHẠM ĐỂ BẮT ĐẦU"* with the caption *"(Chạm màn hình để bật âm thanh)"*.
2. The startup screen does not auto-advance; it waits for an explicit tap or click from the player.
3. The player's first tap initializes and unlocks the browser Web Audio context for in-game sound effects.
4. Rapid double-tapping is debounced so audio initialization and screen transition fire only once.

#### AC03: Routing to Level Selector Hub
1. Tapping *"CHẠM ĐỂ BẮT ĐẦU"* transitions smoothly (200ms crossfade) from the Startup Screen directly to the **Level Selector Hub** (`US-036`), never bypassing into the phone home screen.
2. The Startup Screen unmounts completely after transition with no lingering timers or invisible overlays.

#### AC04: Error Handling & Reduced Motion
1. If a non-critical asset fails to preload, the preloader completes gracefully without blocking the *"CHẠM ĐỂ BẮT ĐẦU"* prompt.
2. When `prefers-reduced-motion: reduce` is enabled, the startup-to-hub transition switches immediately without scale or slide transforms.
3. The primary tap target meets the minimum 44x44px touch target requirement.

---

### Out of Scope

- Third-party parody app 350ms launch splash screens and warm resume caching (owned by [US-025](./us-025-game-boot-title-screen-parody-virtual-app-launch-splash-screens.md)).
- Video cutscenes, user login screens, or cloud save sync.

---

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Asset Budget | Startup screen assets (emblem, title typography) remain lightweight (< 250KB uncompressed) for fast mobile first paint. |
| Browser Compatibility | Web Audio unlock supports iOS Safari 15+, Android Chrome 10+, and modern desktop browsers. |

---

### Dependencies

- [Case & Content Schema Engine (US-001)](./us-001-declarative-case-content-schema-engine.md)
- [Husband Carousel & Level Selector Hub (US-036)](./us-036-husband-carousel-level-selector-hub.md)

---

### Open Questions

None.

---

### Citations

- [Signed-off Elicitation Session](../elicitation/2026-11-27-startup-level-selector-context-lockscreen.md)
- [Signed-off ASCII Wireframe](./wireframes/wireframe-startup-level-flow-lockscreen.md)

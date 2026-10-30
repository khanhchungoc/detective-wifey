---
type: Requirement Story
epic: "Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)"
status: draft
description: "Game boot loading title screen with asset preloader and interactive tap-to-start gate, paired with authentic branded 350ms launch splash screens for third-party parody apps with warm resume caching."
tags: [requirement, user-story, phone-os, shell, boot-screen, splash-screen]
timestamp: "2026-10-21"
---

# US-025 - Game Boot Title Screen & Parody Virtual App Launch Splash Screens

### Epic: [Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)](./epic.md)

As a **Player**, I want to view a dramatic detective game boot loading screen upon loading the web application, followed by authentic branded launch splash screens when opening third-party parody apps.

---

### Canonical Wireframe Reference

- **ASCII Wireframe (Screen SSOT)**: [`wireframe-us-025-boot-and-splash-screens.md`](./wireframes/wireframe-us-025-boot-and-splash-screens.md)
- **Parent Application Design**: [Phone OS Master Design & UI/UX Specification](../../../project-knowledge-base/solution-context/apps/phone-os/app-design.md)
- **Shell Features Specification**: [Phone OS Shell Features Specification](../../../project-knowledge-base/solution-context/apps/phone-os/shell/features.md)

---

### Acceptance Criteria

#### AC01: Game Boot Loading & Asset Preloader
1. Loading the web application displays the fullscreen `GameBootLoadingView` with Noir Charcoal background (`#09090B`), dramatic game title (*"VỢ BẮT GIAN - BẮT ĐƯỢC TIỂU TAM"*), and subtitle (*"Chồng vừa ngủ say... Đã đến lúc điều tra!"*).
2. The view displays a 6px height rounded progress bar showing asset caching progress (audio clips, character portraits, app icon sprites) advancing smoothly from 0% to 100%.
3. Under local or cached conditions, asset preloading completes in under 1.5 seconds without layout shifting.

#### AC02: Interactive Tap-to-Start Gate & Audio Unlock
1. Once asset preloading reaches 100%, the progress bar transitions into an interactive prompt: *"CHẠM ĐỂ BẮT ĐẦU"* with caption *(Chạm màn hình để mở khóa máy)*.
2. The boot screen requires explicit player touch or mouse click to advance; it does not automatically dismiss into the phone home screen.
3. The first player interaction initializes and unlocks the browser Web Audio context for in-game sound effects and background ambience.
4. Tapping the prompt triggers a 200ms smooth crossfade transition, unmounts `GameBootLoadingView`, and mounts the emulated `PhoneShell` SpringBoard launcher grid.
5. Rapid double-tapping on the prompt is debounced to prevent duplicate initialization events.

#### AC03: Third-Party Parody App Launch Splash Screens
1. Launching any of the 8 third-party parody apps (`Zola`, `Techcornbank`, `Shopoo`, `Grap`, `NetSurf`, `GeeMail`, `InkedLin`, `Tim`) from the SpringBoard launcher grid displays the branded `AppLaunchSplashView`.
2. The splash screen renders the target app's canonical brand primary background, a centered $96 \times 96\text{px}$ continuous squircle app icon, uppercase display title, and parody brand slogan as defined in `wireframe-us-025-boot-and-splash-screens.md`.
3. The launch splash screen displays for exactly 350ms before smoothly crossfading into the active application interface over 120ms.
4. Touch interactions during the 350ms splash duration are disabled (`pointer-events: none`) to prevent ghost taps from accidentally triggering controls inside the underlying application.
5. Native system utilities (`Phone`, `Messages`, `Photos`, `Notes`) bypass the splash screen entirely and mount immediately upon being tapped.

#### AC04: Authentic Warm Resume & Session Caching
1. The virtual phone shell maintains an in-memory session registry (`visitedApps: Set<string>`) tracking opened applications during the active case.
2. When a player re-opens an application that is already registered in `visitedApps`, the application view mounts immediately (0ms delay) without re-displaying the launch splash screen.
3. Returning to the home launcher via `< Trang chủ` or the bottom home indicator preserves the app's warm status in `visitedApps`.
4. Triggering a case reset, case restart, or advancing to a new case level clears `visitedApps`, restoring cold launch splash screens for all third-party applications.

#### AC05: Accessibility & Reduced Motion Handling
1. When the user's operating system has `prefers-reduced-motion: reduce` enabled, the game boot screen transitions immediately upon tap without zoom/scale transforms.
2. Under reduced motion mode, third-party app splash screens display for a shortened duration of 150ms as a static frame without scale or spring motion.
3. All interactive elements satisfy minimum touch target guidelines ($\ge 44 \times 44\text{px}$).

---

### Out of Scope

| OOS ID | Description |
|---|---|
| OOS01 | Splash screens for native OS utility apps (`Phone`, `Messages`, `Photos`, `Notes` open immediately). |
| OOS02 | Tap-to-skip interruption during the 350ms app launch splash. |
| OOS03 | Video cutscenes or motion-comic intro movies on boot. |
| OOS04 | Persistent cross-session splash caching in `localStorage` (caching is session-scoped in memory per case). |

---

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Latency SLA | Warm app re-launch mounts in under 50ms with zero perceptible delay. |
| Asset Budget | Game boot screen preloader assets (title SVG, fonts) must not exceed 250KB uncompressed. |
| Memory Lifecycle | Splash screen decorator unmounts completely after expiration with zero persistent DOM nodes or leaked timer handles. |
| Browser Compatibility | Web Audio unlock handles iOS Safari, Android Chrome, and desktop modern browsers. |

---

### Dependencies

- [Case Content Schema Engine](./us-001-declarative-case-content-schema-engine.md)
- [Virtual Phone Shell Container & Launcher](./us-002-virtual-phone-shell-container-8-app-home-grid.md)
- [Unified Virtual Phone Motion Choreography (US-024)](../functional-decomposition.md)

---

### Open Questions

| Question ID | Question | Impact |
|---|---|---|
| - | None. Scope, layout, timing, and caching rules verified and signed off. | N/A |

---

### Citations

- [Signed-off Elicitation Session](../elicitation/2026-10-21-us-025-boot-and-splash-screens.md)
- [Signed-off ASCII Wireframe Specification](./wireframes/wireframe-us-025-boot-and-splash-screens.md)
- [Phone OS Master Design](../../../project-knowledge-base/solution-context/apps/phone-os/app-design.md)

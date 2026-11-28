---
type: Requirement Epic
status: draft
description: "Virtual smartphone shell, system status bar, universal 8-app home screen launcher grid, and modular parody application suite."
tags: [requirement, epic, phone-shell, parody-apps]
timestamp: "2026-10-13T17:35:00+07:00"
---

# Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)

## Summary

The Virtual Phone Shell & MVP Parody App Suite establishes the central player interface for *Bắt được Tiểu tam* (Jealous Wife Detective Game) for **Release 1 (MVP)**. It covers the full entry flow (Startup Boot Screen -> Husband Carousel & Level Selector Hub -> Level Context & Persona Briefing -> iOS 27 Phone Shell Lockscreen -> Home Screen) and emulates a modern Vietnamese husband's smartphone with a titanium bezel frame, Dynamic Island pill cutout, split iOS status bar, Level 1 dynamic home screen launcher, dynamic notification toasts, top-down Notification Dropdown controls (replacing deprecated AssistiveTouch), in-app navigation headers, and pluggable micro-app integration contracts.

## Business Value

- Delivers the core immersive "phone snooping" experience central to the game's comedic premise.
- Limits active apps on Level 1 strictly to the 4 clue apps to eliminate cognitive overload and reading fatigue for casual players.
- Provides a native iOS-style top-down Notification Dropdown allowing players to re-read Case Context, switch levels via the Level Selector Hub, restart cases, or open the Wife's Detective Notebook from any in-phone screen.
- Provides a scalable, decoupled architecture (`AppDefinition`, `CaseConfig`, `LevelCatalog`) allowing future micro-apps and detective cases to be added via declarative data schemas without modifying the UI engine.

## High-Level Requirements

- Outer mobile frame container rendering realistic iOS smartphone ergonomics (393px × 852px viewport base, centered desktop frame).
- Full entry flow: Startup preloader & tap-to-start audio unlock (`US-035`), swipeable Husband Carousel & Level Selector Hub (`US-036`), skippable intro dialogue & Case Context/Persona briefing (`US-037`), and iOS 27 Phone Shell Lockscreen with privacy-masked notifications and hybrid unlock (`US-038`).
- Apple Dynamic Island pill cutout with split status bar displaying narrative clock (*23:45*) on the left and status indicators (cellular signal, *5G*, battery glyph *42%*) on the right.
- Level-based dynamic iOS launcher layout displaying the 4 active MVP clue apps for Level 1 (Zola, Techcornbank, Shopoo, Comms dialer/SMS) across launcher grid and frosted glass dock.
- Top-down Notification Dropdown providing quick mid-case access to Case Briefing (`Hồ sơ vụ án`), Level Selector Hub (`Chọn màn` with confirmation), Case Restart (`Chơi lại`), and Wife's Notebook (`Sổ tay Vợ`). (AssistiveTouch is deprecated.)
- Mobile browser chrome suppression: PWA standalone capability (`apple-mobile-web-app-capable`, `theme-color`), W3C Fullscreen API request on Android/desktop, iOS Safari Add-to-Home-Screen guidance sheet, and viewport scroll/rubber-band lock (`overscroll-behavior: none`).
- Sub-100ms client-side screen switching between home screen launcher and mounted app views.
- Declarative case configuration schema engine statically bundled for zero runtime server dependencies.
- Optional Level 0 highlighted on first play in the Level Selector Hub, Skip to Level 1, and Replay. Tutorial completion is distinct from skipping.

## Business Outcome

Players experience a fluid, culturally authentic smartphone simulation where snooping feels natural and high-stakes. Game designers can deploy new cases and levels entirely through declarative TypeScript schemas.

## Business Rules

- **Level-Based App Launcher Provisioning**: The home screen launcher dynamically mounts only the active apps configured for that level (Level 1 mounts 4 active apps: Zola, Techcornbank, Shopoo, Comms) to eliminate text fatigue and cognitive overload for early players.
- **Client-Side Latency SLA**: App switching and navigation transitions must complete in < 100ms with zero network round-trips.
- **100% Client-Side Privacy**: Zero server calls, zero telemetry, and zero cookie persistence.

## Dependencies

- **Upstream**: Signed-off elicitation session ([`2026-10-13-jealous-wife-detective-game.md`](../elicitation/2026-10-13-jealous-wife-detective-game.md)), Vision & Scope ([`vision-scope.md`](../vision-scope.md)), Functional Decomposition ([`functional-decomposition.md`](../functional-decomposition.md)).
- **Downstream**: Clue inspection & suspicion engine (Epic 02), Wife's notebook & verdict hub (Epic 03), Husband Thịnh Level 1 MVP Case (Epic 04).

## User Stories

* [US-001 - Declarative Case & Content Schema Engine](us-001-declarative-case-content-schema-engine.md) - *Status: draft*
* [US-002 - Virtual Phone Shell Container & Level-Based App Grid](us-002-virtual-phone-shell-container-8-app-home-grid.md) - *Status: draft*
* [US-003 - `Zola` Private Messaging App Module](us-003-zola-private-messaging-app-module.md) - *Status: draft*
* [US-004 - `Techcornbank` Bank & E-Wallet App Module](us-004-techcornbank-bank-e-wallet-app-module.md) - *Status: draft*
* [US-005 - `Shopoo` E-Commerce App Module](us-005-poshee-e-commerce-app-module.md) - *Status: draft*
* [US-008 - `Photos` Gallery & Media Forensics App Module](us-008-photos-gallery-media-forensics-app-module.md) - *Status: draft*
* [US-009 - `Phone` Mobile Dialer & Contacts App Module](us-009-phone-mobile-dialer-contacts-app-module.md) - *Status: draft*
* [US-026 - `Messages` SMS & Parody Chat App Module](us-026-messages-sms-parody-chat-app-module.md) - *Status: draft*
* [US-024 - Unified Virtual Phone Motion Choreography, Transitions & App Animations](us-024-unified-virtual-phone-motion-choreography-transitions-app-animations.md) - *Status: planned*
* [US-025 - Parody Virtual App Launch Splash Screens & Warm Resume Caching](us-025-game-boot-title-screen-parody-virtual-app-launch-splash-screens.md) - *Status: draft; ASCII approved (boot routing moved to US-035)*.
* [US-030 - `Zola` Group Chat & Multi-Participant Thread Module](us-030-zola-group-chat-multi-participant-messaging.md) - *Status: draft*
* [US-035 - Detective App Startup & Entry Routing](us-035-detective-app-startup-entry-routing.md) - *Status: draft; ASCII signed-off*
* [US-036 - Husband Carousel & Level Selector Hub](us-036-husband-carousel-level-selector-hub.md) - *Status: draft; ASCII signed-off*
* [US-037 - Level Context, Husband Persona & Interactive Intro Briefing](us-037-level-context-persona-intro-briefing.md) - *Status: draft; ASCII signed-off*
* [US-038 - iOS 27 Phone Shell Lockscreen & Hybrid Unlock](us-038-ios27-phone-shell-lockscreen-hybrid-unlock.md) - *Status: draft; ASCII signed-off*

## GUI Specifications

* None recorded yet.

## Wireframes

* [Phone Shell & Launcher Interactive HTML Wireframe](wireframes/wireframe-phone-shell-launcher.html)
* [Phone Shell & Launcher ASCII Wireframe](wireframes/wireframe-phone-shell-launcher.md)
* [Zola Private Messaging ASCII Wireframe](wireframes/wireframe-zola-messaging.md)
* [Zola Group Chat ASCII Wireframe](wireframes/wireframe-us-030-zola-group-chat.md)
* [Techcornbank Banking ASCII Wireframe](wireframes/wireframe-techcornbank-banking.md)
* [Shopoo E-Commerce ASCII Wireframe](wireframes/wireframe-poshee-ecommerce.md)
* [Phone Investigation ASCII Wireframe](wireframes/wireframe-phone-investigation.md)
* [Messages Investigation ASCII Wireframe](wireframes/wireframe-messages-investigation.md)
* [Game Boot & Parody App Launch Splash Screens ASCII Wireframe](wireframes/wireframe-us-025-boot-and-splash-screens.md) - *Status: signed-off*.
* [Startup, Level Selector Hub, Case Context & iOS 27 Lockscreen Flow ASCII Wireframe](wireframes/wireframe-startup-level-flow-lockscreen.md) - *Status: signed-off*.

## Diagrams

* None currently required.

## Open Questions

* None. Scope and UX parameters verified against canonical project knowledge.

## Citations

* [Apps & Features Architecture](../../../project-knowledge-base/solution-context/architecture/apps-features-architecture.md)
* [Phone OS Master Design](../../../project-knowledge-base/solution-context/apps/phone-os/app-design.md)
* [Phone OS Shell Features](../../../project-knowledge-base/solution-context/apps/phone-os/shell/features.md)
* [Level 0 Tutorial & Sixth Sense Discovery](../elicitation/2026-10-21-level-0-tutorial-sixth-sense.md)

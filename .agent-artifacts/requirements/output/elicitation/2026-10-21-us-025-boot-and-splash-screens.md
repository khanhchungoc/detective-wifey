---
status: signed-off
artifact_type: elicitation_session
elicitation_status: COMPLETE
created_at: "2026-10-21T20:28:00+07:00"
updated_at: "2026-10-21T20:28:00+07:00"
topic: "us-025-boot-and-splash-screens"
---

# US-025 - Game Boot Title Screen & Parody Virtual App Launch Splash Screens - Elicitation Session

## Purpose & Scope

### Objective
Deliver an authentic, immersive game boot loading experience and branded parody app launch splash screens to emulate genuine mobile smartphone OS boot and application startup behaviors in *Bắt được Tiểu tam*.

### Boundary
| Area | Current Position | Status |
|---|---|---|
| **Layer 1: Game Boot Title Screen** | Fullscreen web application preloader displaying comedic game logo (*"Vợ Bắt Gian / Bắt được Tiểu Tam"*), asset caching progress indicator, and an interactive *"Chạm để bắt đầu"* (Tap to start) prompt to initialize browser audio context and viewport. | Confirmed |
| **Layer 2: Parody App Launch Splash Screens** | Modular `SplashScreen` decorator component displaying branded logo, brand theme color background, and timed auto-dismiss (~350ms) when opening third-party parody apps. | Confirmed |
| **In Scope** | Game boot loading screen with tap-to-start gate; branded launch splash screens for 8 third-party parody apps (`Zola`, `Techcornbank`, `Shopoo`, `Grap`, `NetSurf`, `GeeMail`, `InkedLin`, `Tim`); in-memory warm resume session cache (splash appears only on first launch per case session); timed auto-dismiss (non-skippable 350ms duration); reduced-motion accessibility bypass. | Confirmed |
| **Out of Scope** | Splash screens for native system utilities (`Phone`, `Messages`, `Photos`, `Notes` launch immediately); tap-to-skip interruption during splash; video-based boot cinematics; persistent server-side caching. | Confirmed |

---

## PACT Baseline

### People
| Persona / Role | Commercial Model | Demographics & Literacy | Devices & Hardware | Ergonomics & Preferences | Accessibility & Constraints | Jobs To Be Done (JTBD) & Pain Points | Status |
|---|---|---|---|---|---|---|---|
| **Player (Jealous Wife)** | B2C (Casual Detective Gamer) | Casual mobile/web user; familiar with Vietnamese domestic comedy/drama tropes | Responsive mobile viewport (393px × 852px base) or centered desktop shell | Single-handed touch navigation; clear visual contrast; expects authentic smartphone feel | `prefers-reduced-motion` compliance; tap target $\ge 44 \times 44\text{px}$; no disruptive delays | Experience believable smartphone immersion and dramatic detective entry without sluggish loading delays | Confirmed |
| **Husband (Nguyễn Huy Hoàng)** | Game Character / Target | Tech worker / corporate employee | Simulated iOS smartphone shell | N/A | N/A | Provide believable smartphone illusion hiding incriminating secrets | Confirmed |

### Activities
- Loading the web game URL and observing asset preloading.
- Tapping *"Chạm để bắt đầu"* to initialize audio context and enter the virtual phone home launcher.
- Tapping a third-party app icon (e.g., `Zola`, `Techcornbank`, `Shopoo`) and viewing the branded 350ms splash screen before accessing the app UI.
- Returning to the SpringBoard home screen via `< Trang chủ` or the home indicator bar.
- Re-opening a previously visited app with instant warm resume (zero redundant splash delay).

### Context
- Domestic espionage game setting (*Bắt được Tiểu tam*).
- Parody representations of popular Vietnamese mobile apps (Zalo, Techcombank, Shopee, Grab, Gmail, LinkedIn, Microsoft Teams).
- Balances humorous narrative tension with authentic operating system ergonomics.

### Technologies
- TypeScript / Preact client-side reactive components.
- CSS transitions / Framer Motion orchestration.
- Session-scoped memory state (`visitedApps: Set<string>`) for warm resume tracking.
- Web Audio API user-gesture unlocked on first tap.

---

## Rules & Data

### Rules
| Status | Rule |
|---|---|
| Confirmed | **Interactive Tap-to-Start Gate**: The game boot screen must not auto-dismiss without player interaction. It displays a loading bar until assets preload, then reveals *"Chạm để bắt đầu"* to guarantee browser audio unlocking and proper viewport configuration. |
| Confirmed | **Third-Party App Scope**: Branded launch splash screens apply exclusively to the 8 third-party parody apps (`Zola`, `Techcornbank`, `Shopoo`, `Grap`, `NetSurf`, `GeeMail`, `InkedLin`, `Tim`). Native system utilities (`Phone`, `Messages`, `Photos`, `Notes`) launch immediately without a splash screen. |
| Confirmed | **Authentic Warm Resume**: A third-party app's splash screen is displayed only upon its first launch within an active case playthrough. Subsequent visits to the same app during the session open instantly with zero splash delay. |
| Confirmed | **Non-Skippable Timed Auto-Dismiss**: Launch splash screens run for a smooth, non-blocking 350ms timer before automatically transitioning into the app interface. Tap-to-dismiss is disabled to prevent accidental clicks passing into underlying app content. |
| Confirmed | **Reduced Motion Support**: When `prefers-reduced-motion: reduce` is enabled, the game boot screen transitions instantly upon tap, and app splash screens display for 150ms without zoom/fade scaling effects. |

### Data
| Area | Detail | Status |
|---|---|---|
| **Inputs / Outputs** | App launch events (`launchApp(appId)`), session state (`visitedApps: string[]`), preloader progress (`0–100%`), active view transition. | Confirmed |
| **Source of Truth** | Phone OS shell state manager (`src/shell/`) and app design tokens (`solution-context/apps/`). | Confirmed |
| **Lifecycle / Audit** | Session-level cache cleared upon case reset or level progression restart. | Confirmed |

---

## Decisions & Constraints

| Type | Item | Rationale / Impact | Owner / Status |
|---|---|---|---|
| **Decision** | Interactive Tap-to-Start over auto-advance | Resolves browser autoplay policy for web audio sound effects and guarantees responsive layout mounting. | Confirmed by User |
| **Decision** | Warm resume caching over repeated splash | Prevents gameplay friction and repetitive delays when players repeatedly jump between apps to cross-reference clues. | Confirmed by User |
| **Decision** | Third-party app splash restriction | Mirrors real-world iOS behavior where system utilities launch instantly while heavy third-party apps show branded launch screens. | Confirmed by User |
| **Decision** | Timed auto-dismiss (350ms) | 350ms is optimal for trademark parody recognition without degrading investigative responsiveness. | Confirmed by User |

---

## Open Questions (Parking Lot)

| ID | Area | Question | Needed From | Status / Notes |
|---|---|---|---|---|
| - | - | None. All material scope questions resolved. | - | Closed |

---

## Referenced Documents

- [Phone OS Master Design](file:///c:/Users/BaoPhamQuoc/Defective-wifey/detective-wifey/.agent-artifacts/project-knowledge-base/solution-context/apps/phone-os/app-design.md)
- [Phone OS Shell Features](file:///c:/Users/BaoPhamQuoc/Defective-wifey/detective-wifey/.agent-artifacts/project-knowledge-base/solution-context/apps/phone-os/shell/features.md)
- [Bezel Shell & Viewport Architecture](file:///c:/Users/BaoPhamQuoc/Defective-wifey/detective-wifey/.agent-artifacts/project-knowledge-base/solution-context/apps/phone-os/bezel-shell.md)
- [Functional Decomposition](file:///c:/Users/BaoPhamQuoc/Defective-wifey/detective-wifey/.agent-artifacts/requirements/output/functional-decomposition.md)
- [Epic 01: Virtual Phone Shell & MVP Parody App Suite](file:///c:/Users/BaoPhamQuoc/Defective-wifey/detective-wifey/.agent-artifacts/requirements/output/epic-01-virtual-phone-app-ecosystem/epic.md)

---

## Next Step
Present the combined Artifact Plan for delivery approval. Author Phase 1 ASCII Wireframe (`wireframe-us-025-boot-and-splash-screens.md`), obtain user signoff via `ask_question`, then author streamlined user story `us-025-game-boot-title-screen-parody-virtual-app-launch-splash-screens.md`.


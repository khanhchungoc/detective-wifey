---
type: Requirement Story
epic: "Epic 01: Virtual Phone Shell & Modular Parody App Suite"
status: draft
description: "Implements the iOS-like smartphone bezel frame, Dynamic Island, status bar, frosted dock, and universal 11-app launcher navigation."
tags: [requirement, user-story, frontend, phone-shell, launcher, ios-theme]
timestamp: "2026-10-13T19:15:00+07:00"
---

# US-002 - Virtual Phone Shell Container & Level-Based App Grid

### Epic: [Epic 01: Virtual Phone Shell & Modular Parody App Suite](./epic.md)

As a **Player**, I want to view a virtual smartphone frame mounting only the active apps configured for my current level (Level 1: 3–4 apps; Level 2: 5–6 apps; Level 3: 8–11 apps) so that I can explore apps without cognitive clutter or excessive reading.

---

### Risk, Assumption, Issue, Dependency (RAID) Log

| RAID ID | Type | Description | Impact | Owner | Status |
|---|---|---|---|---|---|
| R01 | Risk | Varying desktop monitor aspect ratios could cause clipping if bezel container scaling is not bounded. | Medium | Frontend Dev | Mitigated |
| A01 | Assumption | Dynamic blur effects for the iOS frosted dock (`backdrop-filter`) are natively supported by target evergreen mobile browsers (Safari iOS 15+, Chrome Android 10+). | Low | Frontend Dev | Validated |
| I01 | Issue | None currently identified. | Low | Lead BA | Resolved |
| D01 | Dependency | Case configuration and app registry provided by [`US-001`](./us-001-declarative-case-content-schema-engine.md). | High | Lead BA | Ready |

---

### Pre-conditions

| Pre-condition ID | Description |
|------------------|-------------|
| PR01             | The web application is loaded in a mobile browser or modern desktop browser. |
| PR02             | Active case configuration has been successfully initialized by the schema engine ([`US-001`](./us-001-declarative-case-content-schema-engine.md)). |

---

### Workflow/Activity Diagram

- N/A (UI presentation and view switching).

---

### Screen / GUI Specification References

| Reference ID | Screen / Artifact | Reference | Story-Relevant Behavior |
|---|---|---|---|
| UI01 | iOS Shell ASCII Wireframe | [`wireframes/wireframe-phone-shell-launcher.md`](./wireframes/wireframe-phone-shell-launcher.md) | Visualizes layout wireframe of the Dynamic Island, upper grid, frosted dock, browser chrome vs fullscreen mode. |
| UI02 | iOS Interactive HTML Wireframe | [`wireframes/wireframe-phone-shell-launcher.html`](./wireframes/wireframe-phone-shell-launcher.html) | Interactive mobile HTML wireframe demonstrating mobile browser vs fullscreen PWA container, app switching, AssistiveTouch menu, and level selection sheet. |

---

### Definitions & Business Rules

- **Level-Based App Launcher Provisioning Rule**: The home screen launcher dynamically mounts only the active registered parody applications configured for the loaded level (Level 1: 3–4 apps; Level 2: 5–6 apps; Level 3: 8–11 apps). Inactive apps are completely omitted from the launcher for that level, preventing cognitive clutter and excessive text reading for casual players.
- **iOS Shell Layout Structure**: The home screen dynamically populates the upper grid and the frosted bottom dock based on the active level's app list. Apps designated for fast access (`Zola`, `Techcornbank`, `Comms`) mount into the frosted dock when active; remaining apps mount into the upper grid rows.
- **Mid-Case Navigation & Level Selector Alignment (2026-11-27)**: AssistiveTouch is deprecated and removed. Mid-case access to Case Context, Level Selector Hub, Case Restart, and Wife's Notebook is now provided through the phone shell's top-down **Notification Dropdown** ([US-038](./us-038-ios27-phone-shell-lockscreen-hybrid-unlock.md)) and the full-screen **Level Selector Hub** ([US-036](./us-036-husband-carousel-level-selector-hub.md)).
- **Sub-100ms Navigation SLA**: App launch and return transitions execute in-memory within 100 milliseconds with zero server latency.

---

### Fallback & Routing Decision Table

| Input state | Observable condition | Selected path | Expected outcome |
|---|---|---|---|
| Valid registered app tapped | App component found in `AppDefinition` registry | Primary launch path | Unmounts home view and displays active app viewport |
| Unregistered or failing app tapped | App component throws error on mount | Fallback error path | Displays toast notification: "Ứng dụng tạm thời không phản hồi. Vui lòng thử lại!" |
| In-app home gesture triggered | User clicks `‹ Trang chủ` or swipes bottom home bar | Return home path | Transitions back to iOS launcher in < 100ms |
| AssistiveTouch tapped | Player taps floating button on any view | Quick menu path | Expands centered quick action menu in < 100ms |
| Level selector opened | Player selects `Chọn màn chơi` | Level sheet path | Slides up bottom sheet with Level 1-3 cards |
| Locked level selected | Player selects locked Level 2 or 3 | Gating restriction path | Blocks level load and displays banner: "Bạn cần vượt qua màn chơi trước để mở khóa màn này!" |
| Protected app tapped | App requires security PIN authentication | Security lockpad path | Displays Shared PIN Lockpad component |
| Incorrect PIN entered | 4th digit entered does not match configured PIN | PIN mismatch penalty path | Shakes lockpad, clears dots, decrements strike, and alerts: "Mã PIN không chính xác! Nghi ngờ tăng lên." |
| Narrative event triggered | Real-time simulation event fires | Notification toast path | Slides down top notification banner with spring animation |
| Fullscreen tapped on Android/Desktop | Fullscreen API supported (`document.fullscreenEnabled = true`) | Fullscreen API request path | Calls `requestFullscreen()` concealing browser address bar and toolbars |
| Fullscreen tapped on iOS Safari | iOS Safari environment detected (Fullscreen API restricted) | PWA guidance sheet path | Slides up Add-to-Home-Screen guidance modal sheet |
| Mobile touch scroll initiated | Touchmove event triggered on body or viewport background | Scroll suppression path | Blocks elastic bounce and pull-to-refresh via `overscroll-behavior: none` |

---

### Business Acceptance Criteria

**AC 1**: Rendering the iOS-Like Smartphone Shell and Level-Based Home Screen Launcher

```gherkin
Given the active investigation session is initialized for Level 1
When the player loads the game interface
Then the system renders the titanium bezel frame with the centered Dynamic Island pill
And the status bar displays narrative time "23:45" on the left and "[Signal] 5G [Battery 42%]" on the right
And the home screen displays only the active parody app icons configured for Level 1 (3 to 4 apps across the launcher grid and dock)
And each registered app with unread items displays a red notification badge per the linked [Wireframe Specification](./wireframes/wireframe-phone-shell-launcher.md)
```

**AC 2**: Sub-100ms Micro-App Launch and In-App Shell Return

```gherkin
Given the player is on the home screen launcher
When the player taps the "Zola" app icon in the frosted dock
Then the system mounts the Zola chat application within 100 milliseconds
And the system renders the top navigation bar displaying "‹ Trang chủ" and title "Zola"
When the player taps "‹ Trang chủ" or the bottom home indicator bar
Then the system unmounts the app and returns to the home screen launcher within 100 milliseconds
```

**AC 3**: Level-Based App Mounting and Inactive App Omission

```gherkin
Given a Level 1 case configuration where only "Zola", "Techcornbank", and "Shopoo" are configured
When the player navigates to the home screen launcher
Then the home screen renders only those 3 active app icons
And non-configured apps (such as "NetSurf", "GeeMail", "Tim", and "InkedLin") are omitted from the launcher
When the player advances to Level 2
Then the home screen dynamically updates to mount 5 to 6 active app icons configured for Level 2
```

**AC 4**: Exception Handling for Unresponsive App Component

```gherkin
Given an app module component fails to render during launch
When the player taps that app icon on the launcher
Then the system catches the component error and displays toast notification: "Ứng dụng tạm thời không phản hồi. Vui lòng thử lại!"
And the system keeps the home screen launcher visible and interactive
```

**AC 5**: AssistiveTouch Action Menu and Level Selector Navigation

```gherkin
Given the player is on any screen in the game
When the player taps the floating AssistiveTouch button
Then the system expands the AssistiveTouch action menu displaying "Màn hình chính", "Sổ tay của vợ", "Chọn màn chơi", and "Chơi lại màn này"
When the player selects "Chọn màn chơi"
Then the system slides up the Level Selector bottom sheet displaying Level 1, Level 2, and Level 3 cards
And the system displays earned star ratings for unlocked levels and a padlock icon for locked levels
```

**AC 6**: Gated Level Access from Level Selector

```gherkin
Given the player has only completed Level 1
When the player opens the Level Selector sheet and taps Level 3
Then the system blocks level launch and displays banner: "Bạn cần vượt qua màn chơi trước để mở khóa màn này!"
```

**AC 7**: Shared PIN Lock Screen Validation and Strike Consumption

```gherkin
Given the player taps a password-protected application or private folder
When the system displays the Shared PIN Lockpad
And the player inputs an incorrect 4-digit PIN
Then the system executes a 400ms horizontal shake animation and flashes red
And the system clears the input dots and displays alert: "Mã PIN không chính xác! Nghi ngờ tăng lên."
And the system consumes 1 remaining attempt from the strike counter
```

**AC 8**: Top Notification Toast Banner Presentation and Interaction

```gherkin
Given the active game session triggers a narrative notification event
When the system generates a toast banner
Then the system displays the top toast banner sliding down within 250 milliseconds
And the toast renders app tag "Zola" and message snippet
When the player taps the toast notification
Then the system directly navigates to the target message thread in the Zola app
```

**AC 9**: Fullscreen View Mode and Mobile Browser Chrome Suppression

```gherkin
Given the player accesses the game via a mobile browser (Chrome or Safari)
When the player taps the Fullscreen button ("⛶ Toàn màn hình") in the AssistiveTouch menu
And the browser runtime supports the W3C Fullscreen API (Android Chrome / Desktop)
Then the system requests element fullscreen concealing the browser navigation toolbars and omnibox
And the system enforces overscroll-behavior: none and touch-action: manipulation to block elastic pull-to-refresh
```

**AC 10**: Standalone PWA and iOS Safari Add-to-Home-Screen Guidance Sheet

```gherkin
Given the player accesses the game via iOS Safari where the W3C Fullscreen API is restricted
When the player taps the Fullscreen button ("⛶ Toàn màn hình") in the AssistiveTouch menu
Then the system slides up the PWA Add-to-Home-Screen guidance modal sheet
And the sheet displays step-by-step instructions: tap Safari Share (⎋), select "Thêm vào MH chính", and launch from the home screen
When the player launches the game from the added home screen icon
Then the system boots in standalone web app mode with zero Safari address bars or bottom toolbars
```

---

### Out of Scope

| OOS ID | Description |
|--------|-------------|
| OOS01  | Native mobile app packaging (Cordova / Capacitor / React Native wrappers). |
| OOS02  | Custom wallpaper upload by player (fixed masculine aesthetic husband wallpaper for MVP). |

---

### Non-functional Requirements

| Requirement | Description |
|---|---|
| Viewport Responsiveness | Fluid portrait scaling between 375px and 430px base width; centered 393px × 852px bezel frame on desktop screens. |
| Transition Performance | Launch and exit animations execute at 60fps with total transition duration <= 180ms. |
| Mobile Browser Immersion | Locks document scroll via `position: fixed; inset: 0; overscroll-behavior: none;` and `touch-action: manipulation` to eliminate rubber-band bouncing and browser URL bar resizing artifacts. |

---

### Open Questions

* None. Visual layout and navigation behaviors verified against canonical `app-design.md`.

---

### Citations

* [Phone OS Master Design](../../../project-knowledge-base/solution-context/apps/phone-os/app-design.md)
* [Phone OS Shell Features](../../../project-knowledge-base/solution-context/apps/phone-os/shell/features.md)
* [Apps & Features Architecture](../../../project-knowledge-base/solution-context/architecture/apps-features-architecture.md)

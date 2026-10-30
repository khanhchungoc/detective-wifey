---
type: Wireframe
status: signed-off
revision: 1
signed_off_at: "2026-10-21"
created_at: "2026-10-21"
description: "Game boot loading preloader and branded third-party parody app launch splash screens."
tags: [wireframe, phone-os, shell, boot-screen, splash-screen, us-025]
---

# US-025 - Game Boot Title Screen & Parody Virtual App Launch Splash Screens ASCII Wireframe Specification

**Subsystem**: Virtual Phone Shell (`phone-os/shell`)  
**Parent Epic**: [`epic-01-virtual-phone-app-ecosystem`](../epic.md)  
**Related User Story**: [`us-025-game-boot-title-screen-parody-virtual-app-launch-splash-screens.md`](../us-025-game-boot-title-screen-parody-virtual-app-launch-splash-screens.md)  
**Parent Specifications**:  
- [Phone OS Master Design](../../../../project-knowledge-base/solution-context/apps/phone-os/app-design.md)  
- [Phone OS Shell Features](../../../../project-knowledge-base/solution-context/apps/phone-os/shell/features.md)  
- [Bezel Shell & Viewport Architecture](../../../../project-knowledge-base/solution-context/apps/phone-os/bezel-shell.md)  
**Viewport Target**: Centered Desktop Chassis / Mobile Portrait Viewport ($393\text{px} \times 852\text{px}$)  
**Design Standard**: Modern Flagship Smartphone Parody & iOS Launch Screen Guidelines  
**Zero-Emoji Invariant**: Strictly enforced bracketed semantic tokens (`[Logo: ...]`, `[Signal: 5G]`, `[Batt: 42%]`, `[Tap: ...]`)  
**User Decision Delta**:  
- Interactive Tap-to-Start on game boot (`Chạm để bắt đầu`) to ensure browser audio unlocking and responsive canvas initialization.  
- Authentic warm resume caching: Launch splash screen displays only on first cold launch per case session; subsequent visits within the case open instantly.  
- Scope restricted to 8 third-party parody apps (`Zola`, `Techcornbank`, `Shopoo`, `Grap`, `NetSurf`, `GeeMail`, `InkedLin`, `Tim`). Native utilities (`Phone`, `Messages`, `Photos`, `Notes`) launch immediately with zero splash.  
- Non-skippable timed auto-dismiss (~350ms duration) without click interruption to maintain smooth visual rhythm.  

---

## 1. Screen 1: Web Game Boot Title Screen (`GameBootLoadingView`)

> **Entry Route**: Initial browser page load (`index.html`).  
> **Key Capabilities**: Dramatic comedic title display, detective brand mark, asset preloader progress bar, audio unlock gesture gate (`Chạm để bắt đầu`), and smooth transition into phone shell.

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Desktop Container / Mobile Viewport: 393px × 852px - Dark Noir Theme]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                      ┌──────────────────────┐                          │
│                      │  [Icon: Broken Heart │                          │
│                      │   + Magnifying Glass]│                          │
│                      └──────────────────────┘                          │
│                                                                        │
│                           VỢ BẮT GIAN                                  │
│                   - BẮT ĐƯỢC TIỂU TAM -                                │
│                                                                        │
│             "Chồng vừa ngủ say... Đã đến lúc điều tra!"               │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                   [ Asset Preloader Progress ]                         │
│             ┌────────────────────────────────────────┐                 │
│             │ [████████████████████████████░░░░░░░░] │ 82%             │
│             └────────────────────────────────────────┘                 │
│                      Đang tải hồ sơ vụ án...                           │
│                                                                        │
│                                                                        │
│                    [ State: Preload Complete ]                         │
│             ┌────────────────────────────────────────┐                 │
│             │    >>> [ CHẠM ĐỂ BẮT ĐẦU ] <<<         │                 │
│             └────────────────────────────────────────┘                 │
│                  (Chạm màn hình để mở khóa máy)                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│   Phiên bản: Vụ Án Chồng Hoàng (Màn 1) • 13+ Hài hước & Kịch tính      │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Inventory & Layout Tokens (`GameBootLoadingView`)
- **Surface**: Noir Charcoal (`#09090B`) with subtle deep vignette gradient.
- **Brand Title**: 24px Bold uppercase tracking (`#F43F5E` Rose Red accent + `#FAFAFA` White).
- **Tagline**: 13px Regular italic (`#A1A1AA` Muted Slate).
- **Progress Bar**: Height 6px, rounded pill border-radius (9999px), background `#27272A`, fill `#F43F5E`.
- **Tap-to-Start Button**: Min touch target $240\text{px} \times 48\text{px}$ pill, pulse glow animation, font size 15px Bold (`#FFFFFF` on `#E11D48` Crimson or outline glow).
- **Audio Context Initializer**: Triggered on first user interaction click/tap.

---

## 2. Screen 2: Third-Party Parody App Launch Splash Screen (`AppLaunchSplashView`)

> **Entry Route**: Tapping a third-party app icon from the SpringBoard launcher grid (`Zola`, `Techcornbank`, `Shopoo`, etc.).  
> **Key Capabilities**: High-speed branded visual splash (350ms duration), brand logo icon, brand identity background, brand parody slogan, non-blocking auto-dismiss timer, warm resume bypass.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 23:45                                     [Signal: 5G] [||||] [Batt: 42%] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                      ┌──────────────────────┐                          │
│                      │                      │                          │
│                      │   [Brand App Icon    │                          │
│                      │    Squircle: 96x96]  │                          │
│                      │                      │                          │
│                      └──────────────────────┘                          │
│                                                                        │
│                           [ APP TITLE ]                                │
│                                                                        │
│                       [ Parody Brand Slogan ]                          │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                                                                        │
│                           from ParodyOS                                │
├────────────────────────────────────────────────────────────────────────┤
│                        ═══════ [ - ] ═══════                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Third-Party Parody App Branding Token Inventory

| App ID | Display Title | Brand Primary | Surface Background | Parody Slogan Copy | Icon Asset / Glyph |
|---|---|---|---|---|---|
| `zola` | **Zola** | `#0088FF` Electric Blue | `#0088FF` | *"Kết nối triệu niềm tin - Nhắn tin không giấu diếm"* | `[Icon: Zola Chat Speech Bubble]` |
| `techcornbank` | **Techcornbank** | `#ED1C24` Tech Red | `#FFFFFF` Pure White | *"Vượt trội hơn mỗi ngày - Số dư minh bạch"* | `[Icon: Techcornbank Dual Red Squares]` |
| `poshee` / `shopoo` | **Shopoo** | `#EE4D2D` Shopee Orange | `#EE4D2D` | *"Gì cũng có - Mua là giấu"* | `[Icon: Shopoo Shopping Bag with S]` |
| `grap` | **Grap** | `#00B14F` Grab Green | `#00B14F` | *"Đưa đón tận nơi - Lịch trình bí mật"* | `[Icon: Grap Car Silhouette]` |
| `netsurf` | **NetSurf** | `#007AFF` Safari Blue | `#0F172A` Slate Dark | *"Lướt web ẩn danh - Xóa sạch lịch sử"* | `[Icon: NetSurf Compass & Waves]` |
| `geemail` | **GeeMail** | `#EA4335` Google Red | `#FFFFFF` Pure White | *"Hộp thư công việc - Thông báo bảo mật"* | `[Icon: GeeMail Quad-Color Envelope]` |
| `inkedlin` | **InkedLin** | `#0A66C2` LinkedIn Blue | `#0A66C2` | *"Mạng lưới nghề nghiệp - Đồng nghiệp thân thiết"* | `[Icon: InkedLin in-Square Tile]` |
| `tim` | **Tim** | `#464EB8` Teams Indigo | `#292B4A` Deep Indigo | *"Cộng tác nhóm - Họp kín nửa đêm"* | `[Icon: Tim Two-Figure Collaboration]` |

---

## 3. State Transitions & Lifecycle Interactions

```mermaid
%%{init: {"flowchart": {"defaultRenderer": "elk"}}}%%
flowchart TD
    BOOT_LOAD["Game Boot Screen\n(Asset Preloader 0-100%)"] -->|Assets Cached| BOOT_READY["Prompt: 'Chạm để bắt đầu'"]
    BOOT_READY -->|Player Taps Screen| AUDIO_UNLOCK["Unlock Web Audio Context\n& Mount Phone Shell"]
    AUDIO_UNLOCK --> LAUNCHER["SpringBoard 12-App Grid\n(activeScreen: 'launcher')"]

    LAUNCHER -->|Tap Native Utility App\n(Phone, Messages, Photos, Notes)| DIRECT_OPEN["Instant Launch (0ms splash)\nReveal App View Directly"]
    LAUNCHER -->|Tap Third-Party App\n(Zola, Techcornbank, etc.)| CHECK_CACHE{"visitedApps.has(appId)?"}

    CHECK_CACHE -->|Yes (Warm Resume)| DIRECT_OPEN
    CHECK_CACHE -->|No (Cold Launch)| SPLASH_VIEW["Render AppLaunchSplashView\n(Theme background, Logo, Slogan)"]

    SPLASH_VIEW -->|Timer 350ms Expired| RECORD_CACHE["Add appId to visitedApps Set\nMount Target App Component"]
    RECORD_CACHE --> DIRECT_OPEN

    DIRECT_OPEN -->|Tap Home Indicator / '< Trang chủ'| LAUNCHER
```

### Detailed Interaction & Behavioral Specifications

| Event | Source Component | Behavioral Outcome | Constraints & Safeguards |
|---|---|---|---|
| **Page Mount** | `GameBootLoadingView` | Loads audio assets, character dossiers, and app icons while rendering progress bar from 0% to 100%. | Progress completes in $\le 1.5\text{s}$ under local/cached conditions. |
| **Tap to Start** | `GameBootLoadingView` | Executes `AudioContext.resume()`, dispatches transition zoom/fade, unmounts boot view, and mounts `PhoneShell`. | Tap target covers whole screen; prevents double-tap race conditions. |
| **First App Launch** | `SpringBoard` $\rightarrow$ `App` | If `appId` is in 3rd-party registry and `!visitedApps.has(appId)`, renders `AppLaunchSplashView` for exactly 350ms. | Touch gestures on splash screen are ignored (`pointer-events: none`) to prevent ghost taps into app UI. |
| **Splash Expiration** | `AppLaunchSplashView` | At $t = 350\text{ms}$, opacity crossfades into the target app screen over $120\text{ms}$, and adds `appId` to `visitedApps`. | Seamless handoff to active app view with zero layout flickering. |
| **Warm App Re-launch** | `SpringBoard` $\rightarrow$ `App` | If `visitedApps.has(appId)`, target app mounts immediately (0ms splash delay). | Completely eliminates navigation friction when cross-referencing clues. |
| **Case Reset / Level Jump** | `CaseManager` | Clears `visitedApps` cache, resetting all third-party apps to cold splash status for the new investigation. | Fresh narrative immersion on new case entry. |
| **Reduced Motion** | System Chrome | When `prefers-reduced-motion` is active, game boot starts immediately on tap; app splash duration is shortened to 150ms without zoom/scale transforms. | WCAG 2.1 AA Motion Accessibility compliance. |

---

## 4. Canonical Wireframe Reference Traceability
- **Governing User Story**: `US-025`
- **Parent Epic Container**: `Epic 01: Virtual Phone Shell & MVP Parody App Suite`
- **Reviewed Under**: Elicitation Session `2026-10-21-us-025-boot-and-splash-screens.md`

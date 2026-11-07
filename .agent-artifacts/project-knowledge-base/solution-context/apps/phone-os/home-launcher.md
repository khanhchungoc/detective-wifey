---
type: Design Specification Topic
app_id: phone_os
topic: home-launcher
status: approved
description: "iOS SpringBoard launcher layout, 2x2 detective smart widget card, continuous squircle geometry, and 4-app frosted dock tray rules."
tags: [design-tokens, launcher, springboard, dock, squircle, widget, phone-os]
timestamp: "2026-10-14T09:25:00+07:00"
---

# Phone OS - Home Screen Launcher & SpringBoard Grid

> **Parent Design Master**: [app-design.md](app-design.md)  
> **Standard**: iOS SpringBoard Design System with Narrative Detective Integration

---

## 1. SpringBoard Architecture Overview

The home screen launcher reproduces the iOS SpringBoard interface, organizing apps into an upper grid and a persistent frosted glass dock tray:

```
┌────────────────────────────────────────────────────────┐
│ 23:45             [ Dynamic Island ]    [Signal] [Batt]│
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────────────────┐   ┌──────────────────────┐   │
│  │  [Time] 23:45        │   │  [Cal] THỨ BA        │   │
│  │  Hôm nay             │   │  13 Tháng 10         │   │
│  │  "Chồng báo trực đêm"│   │  Pin: 42% (Tiết kiệm)│   │
│  └──────────────────────┘   └──────────────────────┘   │
│           (iOS 2x2 Detective Smart Stack Widget)       │
│                                                        │
├────────────────────────────────────────────────────────┤
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌───────┐│
│  │  Shopoo  │   │   Grap   │   │ NetSurf  │   │ Photos││
│  │ [ShopBag]│   │  [Car]   │   │[Compass] │   │[Image]││
│  └──────────┘   └──────────┘   └──────────┘   └───────┘│
│     Shopoo          Grap         NetSurf       Photos  │
│                                                        │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌───────┐│
│  │ GeeMail  │   │ InkedLin │   │   Tim    │   │ Notes ││
│  │  [Mail]  │   │ [Brief]  │   │ [People] │   │[DocTxt││
│  └──────────┘   └──────────┘   └──────────┘   └───────┘│
│     GeeMail       InkedLin         Tim         Notes   │
│                                                        │
│                 ••••   [ [Search] Tìm kiếm ]           │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │  (Frosted Glass Dock - Strict Zero-Label Invariant)│ │
│ │  ┌──────┐       ┌──────┐       ┌──────┐    ┌─────┐ │ │
│ │  │Phone │       │ Zola │(3)    │Techc.│(1) │Msgs │(4)│
│ │  │[Call]│       │[Chat]│       │[Card]│    │[SMS]│ │ │
│ │  └──────┘       └──────┘       └──────┘    └─────┘ │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ ══════════════════════ [ - ] ═════════════════════════ │
└────────────────────────────────────────────────────────┘
```

* **Level-Scoped App Enablement**: Up to 12 apps are shown on the SpringBoard grid. Apps included in the active level's scope are enabled (`isEnabled: true`), whereas out-of-scope apps are visibly disabled (`opacity: 0.38`, `filter: grayscale(85%)`, `aria-disabled="true"`). Higher levels progressively enable more apps (Level 0/1: 3-4 enabled; Level 2: 5-6 enabled; Level 3: 8-12 enabled).

---

## 2. Detective Narrative Smart Stack Widget (iOS Widget Pattern)

### 2.1. Why Avoid Raw Android-Style Floating Clocks
On native iOS SpringBoard, giant digital clocks do not float freely over the wallpaper. Large time and date cues are officially housed inside **iOS Widgets** ($2 \times 2$ square or $2 \times 4$ rectangular cards with frosted backgrounds and rounded corners).

### 2.2. Widget Specification
* **Dimensions**: Two adjacent $2 \times 2$ widgets or one $2 \times 4$ wide widget card ($160\text{px}$ width $\times 160\text{px}$ height per square).
* **Surface**: Translucent frosted dark glass (`rgba(30, 41, 59, 0.70)`, `backdrop-filter: blur(20px)`, border `1px solid rgba(255, 255, 255, 0.12)`).
* **Corner Radius**: $24\text{px}$ (matching iOS widget curvature).
* **Contents**:
  - Narrative Clock: $32\text{px}$–$36\text{px}$ Light / Semibold tabular font (`23:45`).
  - Calendar / Day: $13\text{px}$ Semibold uppercase red/white tag (`THỨ BA, 13 THÁNG 10`).
  - Narrative Suspicion Hook: $11\text{px}$ subtle quote (*"Chồng báo bận trực ca đêm..."*), reinforcing the detective gameplay without breaking phone realism.

---

## 3. Continuous Squircle Icon Geometry

App icons must adopt Apple's superellipse continuous curvature rather than standard CSS circular radii:

* **Dimensions**: $60\text{px} \times 60\text{px}$ (scaled to $48\text{px}$–$54\text{px}$ on compact mobile viewports).
* **Curvature Token**: `border-radius: 22.5%` ($13.5\text{px}$–$14\text{px}$ on $60\text{px}$ icons).
* **Surface & Lighting**: Rich gradient background with a subtle inner border (`border: 1px solid rgba(255, 255, 255, 0.18)`) and ambient drop shadow (`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25)`).
* **App Icon Labels**:
  - Font Size: $12\text{px}$ Medium ($500$).
  - Color: `#ffffff` with Gaussian text shadow (`drop-shadow: 0 1px 2px rgba(0, 0, 0, 0.80)`).
* **Notification Badges**:
  - Position: `-top-1 -right-1`.
  - Dimensions: Min $18\text{px} \times 18\text{px}$ capsule, red `#ef4444`, pure white $10\text{px}$ bold text, with a $1.5\text{px}$ dark border.

---

## 4. Frosted Glass Dock Tray (4-App iOS Dock)

* **Dock Capacity**: 4 apps horizontally across all active levels.
* **Surface Glass**:
  ```css
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 34px;
  ```
* **Strict Zero-Label Invariant**:
  - Icons placed inside the dock tray **MUST NOT display text labels** underneath.
  - Only the squircle icon and active notification badge are rendered inside the dock container.

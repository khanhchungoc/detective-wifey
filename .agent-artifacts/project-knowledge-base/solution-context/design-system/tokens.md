---
type: Universal Design Specification
system_name: Parody Phone OS Universal Design System
topic: tokens
status: approved
description: "Authoritative design tokens specification covering universal semantic colors, 3-tier frosted glass hierarchy, spacing scale, elevation z-index ladder, and border radius squircles."
tags: [design-tokens, colors, glassmorphism, z-index, spacing, border-radius]
timestamp: "2026-10-15T09:20:00+07:00"
---

# Design System - Core Design Tokens & System Colors

> **Parent Design Master**: [design.md](design.md)  
> **Scope**: Universal tokens inherited by all virtual parody apps and the Phone OS shell.

---

## 1. Universal Semantic Colors & System Tokens

All parody apps and the Phone OS shell inherit these universal semantic color tokens to guarantee visual cohesion, accessible WCAG contrast, and consistent detective feedback:

| Token Name | Base Value | Semantic Role & Universal Usage |
|---|---|---|
| `--sys-canvas` | `#0B1329` | Base dark backdrop canvas across mobile shell and default screens |
| `--sys-surface` | `rgba(30, 41, 59, 0.70)` / `#1E293B` | Content cards, list rows, chat containers, and modal backdrops |
| `--sys-surface-elevated` | `rgba(15, 23, 42, 0.90)` / `#0F172A` | Elevated bottom sheets, action sheets, and modal barrier surfaces |
| `--sys-text-primary` | `#F8FAFC` (`#FFFFFF`) | Primary high-contrast text, dialogue narrative, view titles, and input text (Dark Mode) |
| `--sys-text-secondary` | `#94A3B8` | Secondary metadata, timestamps, subtitles, photo EXIF, and list snippets (Dark Mode) |
| `--sys-text-tertiary` | `#64748B` | Footnotes, inactive labels, and input placeholders (Dark Mode) |
| `--sys-divider` | `rgba(255, 255, 255, 0.12)` | Hairline dividers ($0.5\text{px}$–$1\text{px}$) and micro-borders |
| `--sys-accent` | `#007AFF` / `#38BDF8` | Universal iOS blue interactive controls, focus outlines, and active state tint |
| `--sys-badge-red` | `#EF4444` | Notification badge counter pills, unread alerts, and strike indicators |
| `--sys-clue-amber` | `#F59E0B` | Uncollected clue warning pills and detective HUD highlights |
| `--sys-success-green` | `#22C55E` | Verified checkmarks, successful transactions, online status, and victory state |

### 1.1. Apple HIG iOS Dynamic Label & Font Color Hierarchy
For components rendering over light surfaces (e.g. `.glass-toast-light`, modal alert sheets, light in-app messaging feeds), the system adopts the official Apple Human Interface Guidelines label hierarchy:

| Token Name | Light Surface Value | Dark Surface Value | Semantic Role & Universal Usage |
|---|---|---|---|
| `--ios-label-primary` | **`#000000`** (`rgba(0, 0, 0, 1.0)`) | `#FFFFFF` | Primary high-contrast text, titles, user input, and toast headlines |
| `--ios-label-secondary` | **`#52525B`** (`rgba(60, 60, 67, 0.72)`) | `#94A3B8` (`rgba(235, 235, 245, 0.68)`) | Secondary labels, subtitles, timestamps, and metadata (enforces $\ge 4.5:1$ WCAG AA contrast) |
| `--ios-label-tertiary` | **`#64748B`** (`rgba(60, 60, 67, 0.58)`) | `#64748B` (`rgba(235, 235, 245, 0.45)`) | Inactive controls, placeholder text, and subtle captions |
| `--ios-label-quaternary` | **`rgba(60, 60, 67, 0.18)`** | `rgba(235, 235, 245, 0.18)` | Hairline dividers, disabled labels, and decorative accents |

### 1.2. Color Ownership & Delegation Rules
1. **Universal Enforcement**: Universal semantic tokens (`--sys-*`) govern text contrast, hairline borders, feedback states (red/amber/green), and base glass materials across **all virtual apps**.
2. **Phone OS Shell Colors**: Physical hardware bezel (`#18181B`), metallic slate ring (`#3F3F46`), Dynamic Island (`#000000`), wallpaper gradients, and launcher dock styling are authoritatively owned by [phone-os/app-design.md](../apps/phone-os/app-design.md) and [phone-os/shell/app-design.md](../apps/phone-os/shell/app-design.md).
3. **Parody App Brand Palettes**: Third-party parody apps authoritatively define and encapsulate their proprietary brand colors (e.g. `Zola` electric blue, `Techcornbank` scarlet red, `Shopoo` vibrant orange, `Grap` green) inside their local scopes under [`../apps/<app_id>/app-design.md`](../apps/). Brand colors must never pollute universal tokens or cross app boundaries.

---

## 2. Dialed-Down iOS Frosted Glass Hierarchy

To preserve native mobile fidelity while ensuring lightweight performance across web browsers, the system uses a compact 3-tier frosted glass hierarchy:

| Glass Tier | Class Name | CSS Recipe | Target Components |
|---|---|---|---|
| **Subtle Glass** | `.glass-subtle` | `background: rgba(255, 255, 255, 0.12);`<br>`backdrop-filter: blur(16px);`<br>`border: 1px solid rgba(255, 255, 255, 0.18);` | Dock tray, Search pill, Keypad circular buttons |
| **Elevated Glass** | `.glass-elevated` | `background: rgba(30, 41, 59, 0.90);`<br>`backdrop-filter: blur(20px);`<br>`border: 1px solid rgba(255, 255, 255, 0.12);`<br>`box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);` | Shared PIN keypad modal, Bottom sheets, Context menus |
| **Light Toast Glass** | `.glass-toast-light` | `background: rgba(255, 255, 255, 0.95);`<br>`backdrop-filter: blur(16px);`<br>`border: 1px solid #E2E8F0;`<br>`box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);` | Notification banner toasts, Floating timestamps |

---

## 3. Spacing Scale

All margins, paddings, icon bounds, and layout dimensions adhere to an **$8\text{px}$ base grid** with a **$4\text{px}$ micro-step**:

| Token | Dimension | Rem | Semantic Usage |
|---|---|---|---|
| `--space-1` | $4\text{px}$ | `0.25rem` | Micro-padding, icon-to-badge gaps, hairline borders |
| `--space-2` | $8\text{px}$ | `0.5rem` | Compact item gap, badge padding, button text spacing |
| `--space-3` | $12\text{px}$ | `0.75rem` | Card internal padding, dense feed item spacing |
| `--space-4` | **$16\text{px}$** | **`1.0rem`** | **Standard Universal Gutter (Screen side margins)** |
| `--space-5` | $20\text{px}$ | `1.25rem` | Form field padding, section header top spacing |
| `--space-6` | $24\text{px}$ | `1.5rem` | Section vertical separation, modal sheet header gap |
| `--space-8` | $32\text{px}$ | `2.0rem` | Major group separation, lockpad keypad vertical spacing |
| `--space-10` | $40\text{px}$ | `2.5rem` | View header top offset |
| `--space-12` | $48\text{px}$ | `3.0rem` | Bottom dock bottom offset, FAB floating margin |

---

## 4. Elevation & Z-Index Layer Stack

All layered UI elements must respect this standardized z-index ladder to prevent stacking clashes:

| Layer Level | Z-Index Token | Component / Screen Surface |
|---|---|---|
| **Wallpaper & Canvas** | `z-0` | Desktop outer chassis background, OS wallpaper image |
| **SpringBoard Grid** | `z-10` | Home screen icons, Detective widget, Dock tray |
| **Active Virtual App** | `z-20` | Fullscreen virtual app viewport (`Zola`, `Techcornbank`, etc.) |
| **In-App Sticky Chrome** | `z-30` | In-app navigation header, sticky bottom tab bar |
| **System Status Bar** | `z-40` | Top `StatusBar` and Dynamic Island pill |
| **Persistent Game HUD** | `z-50` | `AssistiveTouch` button, Wife's Notebook FAB trigger |
| **Modal Drawers & Lockpad** | `z-60` | `SharedPinLockpad`, `LevelSelectorSheet`, PWA guide |
| **Notification Toast** | `z-70` | Slide-down `NotificationBanner` |
| **Full-Screen Confrontation** | `z-80` | Wife's Notebook Confrontation evaluation canvas |
| **System Emergency Alerts** | `z-100` | Browser error boundary, fatal network alert toast |

---

## 5. Border Radius Tokens & Squircles

```css
:root {
  --radius-xs: 4px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-sheet: 28px;
  --radius-pill: 9999px;
  --radius-squircle: 22.5%; /* Continuous Apple-style squircle */
}
```

---

## 6. Apple HIG Dynamic Typography Scale Tokens

All parody applications and the Phone OS shell inherit this standardized 12-tier dynamic typography scale to ensure authentic iOS typography, uniform readability, and seamless dynamic font scaling across all browsers:

| Token Name | Tailwind Utility | Font Size (REM / PX) | Weight | Line Height | Tracking | Semantic Role Across All Apps |
|---|---|---|---|---|---|---|
| `--ios-font-large-title` | `text-ios-large-title` | `2.125rem` ($34\text{px}$) | Bold ($700$) | `2.5625rem` ($41\text{px}$) | `-0.025em` | Top-level view headers (Chat List, Photo Albums, App stores) |
| `--ios-font-title-1` | `text-ios-title-1` | `1.75rem` ($28\text{px}$) | Bold ($700$) | `2.125rem` ($34\text{px}$) | `-0.02em` | Case victory headers, level transition titles, confrontation verdicts |
| `--ios-font-title-2` | `text-ios-title-2` | `1.375rem` ($22\text{px}$) | Bold ($700$) | `1.75rem` ($28\text{px}$) | `-0.015em` | Modal sheet headings, security prompt alerts, section titles |
| `--ios-font-title-3` | `text-ios-title-3` | `1.25rem` ($20\text{px}$) | Semibold ($600$) | `1.5625rem` ($25\text{px}$) | `-0.01em` | In-app group headers, lockpad target app label |
| `--ios-font-headline` | `text-ios-headline` | `1.0625rem` ($17\text{px}$) | Semibold ($600$) | `1.375rem` ($22\text{px}$) | `-0.025em` | Toast titles, contact names, primary buttons, table header cells |
| `--ios-font-body` | `text-ios-body` | `1.0625rem` ($17\text{px}$) | Regular ($400$) | `1.375rem` ($22\text{px}$) | `-0.025em` | Body copy, dialogue narrative, email narrative, form inputs |
| `--ios-font-callout` | `text-ios-callout` | `1.0rem` ($16\text{px}$) | Regular ($400$) | `1.3125rem` ($21\text{px}$) | `-0.015em` | Subtitle alerts, secondary actionable callouts, badge descriptions |
| `--ios-font-subheadline` | `text-ios-subheadline` | `0.9375rem` ($15\text{px}$) | Regular ($400$) | `1.25rem` ($20\text{px}$) | `-0.01em` | Status bar narrative clock, search inputs, list item subtitles |
| `--ios-font-footnote` | `text-ios-footnote` | `0.8125rem` ($13\text{px}$) | Regular ($400$) | `1.125rem` ($18\text{px}$) | `-0.005em` | Timestamps in feeds, photo EXIF metadata, footnotes |
| `--ios-font-caption-1` | `text-ios-caption-1` | `0.75rem` ($12\text{px}$) | Medium ($500$) | `1.0rem` ($16\text{px}$) | `0px` | Home screen app icon labels, tab bar item labels |
| `--ios-font-caption-2` | `text-ios-caption-2` | `0.6875rem` ($11\text{px}$) | Semibold ($600$) | `0.8125rem` ($13\text{px}$) | `+0.01em` | Notification badge counters, battery percentage tag |
| `--ios-font-lockpad-digit` | `text-ios-lockpad-digit` | `2.125rem` ($34\text{px}$) | Light ($300$) | `2.375rem` ($38\text{px}$) | `0px` | Shared PIN keypad number buttons ($0$–$9$) |
| `--ios-font-lockpad-subtext`| `text-ios-lockpad-subtext`| `0.625rem` ($10\text{px}$) | Bold ($700$) | `0.75rem` ($12\text{px}$) | `+0.8px` / `+0.08em` | Keypad alphabet subtext (`ABC`, `DEF`, `GHI`...) |

### 6.1. Typography Universality & Brand Color Decoupling Invariant
* **Universality Rule**: Under [design.md §3.1.1](design.md#311-universal-shared-typography-scale-vs-scoped-app-font-color-invariant), Font Family, Font Sizes, Font Weights, Line Heights, and Optical Tracking are **100% universal and immutable across all virtual apps**.
* **Decoupled Font Color**: The utility classes `text-ios-*` define typography without colors. Virtual apps are strictly required to pair `text-ios-*` with their local brand colors (e.g. `text-ios-headline text-[#0088FF]` for Zola, `text-ios-headline text-[#EE4D2D]` for Shopoo). Arbitrary pixel classes (`text-[10px]`, `text-[11px]`) and standard unmapped Tailwind font sizes (`text-xs`, `text-sm`) are forbidden inside virtual app implementations.

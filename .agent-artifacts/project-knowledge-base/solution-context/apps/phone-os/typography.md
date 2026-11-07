---
type: Design Specification Topic
app_id: phone_os
topic: typography
status: approved
description: "Apple HIG dynamic type scale, cross-platform Inter font stack fallback, tabular numeral formatting, and typographic tokens for the Virtual Phone OS."
tags: [design-tokens, typography, dynamic-type, fonts, apple-hig, phone-os]
timestamp: "2026-10-14T09:25:00+07:00"
---

# Phone OS - Typography & Dynamic Type Scale Specification

> **Parent Design Master**: [app-design.md](app-design.md)  
> **Standard**: Apple Human Interface Guidelines (HIG) Typography Adaptation with Parody Compliance

---

## 1. Font Family & Cross-Platform Fallback Chain

To maintain visual iOS parity across all browsers and platforms while strictly respecting Apple's font licensing (which prohibits web-hosting San Francisco `.woff2` files):

```css
/* Canonical Cross-Platform iOS Typography Stack */
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "SF Pro Text",
  "SF Pro Display",
  "Inter",
  -system-ui,
  sans-serif;
```

### Platform Resolution Behavior:
* **macOS / iOS Safari**: Resolves natively to system **San Francisco (`SF Pro`)**.
* **Windows & Android Web**: Resolves to **[Inter](https://rsms.me/inter/)** (SIL Open Font License), which mirrors the geometric proportions, aperture, and x-height of San Francisco.
* **Prohibited Web Serving**: Raw Apple font files (`SFProText-Regular.woff2`) must never be hosted on the web server.

---

## 2. Dynamic Type Scale Tokens

All text rendered within the Phone OS and native parody apps maps to this 12-tier Apple HIG dynamic scale:

| Token / HIG Style | Font Size | Font Weight | Line Height | Tracking (Letter Spacing) | Semantic Usage |
|---|---|---|---|---|---|
| `--ios-font-large-title` | $34\text{px}$ (`2.125rem`) | Bold ($700$) | $41\text{px}$ | `-0.4px` (`-0.025em`) | Top-level view headers (e.g. Chat List, Photo Albums) |
| `--ios-font-title-1` | $28\text{px}$ (`1.75rem`) | Bold ($700$) | $34\text{px}$ | `-0.3px` (`-0.02em`) | Major milestone titles, victory & confrontation headers |
| `--ios-font-title-2` | $22\text{px}$ (`1.375rem`) | Bold ($700$) | $28\text{px}$ | `-0.26px` (`-0.015em`) | Modal sheet headings, security prompt alerts |
| `--ios-font-title-3` | $20\text{px}$ (`1.25rem`) | Semibold ($600$) | $25\text{px}$ | `-0.2px` (`-0.01em`) | In-app section headers, lockpad target app label |
| `--ios-font-headline` | $17\text{px}$ (`1.0625rem`) | Semibold ($600$) | $22\text{px}$ | `-0.4px` (`-0.025em`) | Notification toast titles, contact names, primary buttons |
| `--ios-font-body` | $17\text{px}$ (`1.0625rem`) | Regular ($400$) | $22\text{px}$ | `-0.4px` (`-0.025em`) | Body copy, message bubbles, email narrative |
| `--ios-font-callout` | $16\text{px}$ (`1.0rem`) | Regular ($400$) | $21\text{px}$ | `-0.3px` (`-0.015em`) | Subtitle alerts, secondary actionable callouts |
| `--ios-font-subheadline` | $15\text{px}$ (`0.9375rem`) | Regular ($400$) | $20\text{px}$ | `-0.2px` (`-0.01em`) | Status bar narrative clock, search placeholder |
| `--ios-font-footnote` | $13\text{px}$ (`0.8125rem`) | Regular ($400$) | $18\text{px}$ | `-0.1px` (`-0.005em`) | Timestamps in message lists, image metadata |
| `--ios-font-caption-1` | $12\text{px}$ (`0.75rem`) | Medium ($500$) | $16\text{px}$ | `0px` | Home screen app icon labels (with drop shadow) |
| `--ios-font-caption-2` | $11\text{px}$ (`0.6875rem`) | Semibold ($600$) | $13\text{px}$ | `+0.1px` (`+0.01em`) | Notification badges, battery percentage tag |
| `--ios-font-lockpad-digit` | $34\text{px}$ (`2.125rem`) | Light ($300$) | $38\text{px}$ | `0px` | Shared PIN keypad number buttons ($0$–$9$) |
| `--ios-font-lockpad-subtext` | $10\text{px}$ (`0.625rem`) | Bold ($700$) | $12\text{px}$ | `+0.8px` (`+0.08em`) | Keypad alphabet subtext (`ABC`, `DEF`, `GHI`...) |

---

## 3. Typographic Rules & Nuances

### 3.1. Tabular Numerals (`font-variant-numeric: tabular-nums`)
All numerical displays subject to real-time mutation or column alignment MUST enforce `tabular-nums`:
- Status bar clock (`23:45`)
- Battery level (`42%`)
- Lockout timer countdowns (`00:59`)
- PIN dot indicators and strike counts (`Lượt thử còn lại: 3/4`)

### 3.2. Negative Optical Tracking
Headlines and titles $\ge 17\text{px}$ use negative tracking (`-0.015em` to `-0.025em`) to match Apple's display type tightness. Captions and small labels $\le 11\text{px}$ use neutral or slight positive tracking (`+0.01em`) to maintain legibility.

### 3.3. Text Contrast & Drop Shadows on Wallpapers
App icon labels on the Home Screen must apply a dark Gaussian drop shadow to remain legible across varied wallpapers:
```css
filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.75));
```

### 3.4. Dock Label Invariant
Icons seated within the bottom frosted glass dock tray **never display text labels**. Their label text must be omitted or hidden (`display: none`).

### 3.5. Apple HIG Semantic Label Colors (Light vs. Dark Surfaces)
Text rendered across the OS and parody apps adheres to Apple HIG semantic label color tokens depending on the underlying surface luminance:
* **Light Surfaces (Toasts, Light App Feeds, White Documents)**:
  * Primary Label (`--ios-label-primary`): Pure Black **`#000000`** (`rgba(0, 0, 0, 1.0)`)
  * Secondary Label (`--ios-label-secondary`): **`#52525B`** (`rgba(60, 60, 67, 0.72)`, enforces $\ge 4.5:1$ WCAG AA contrast)
  * Tertiary Label (`--ios-label-tertiary`): **`#64748B`** (`rgba(60, 60, 67, 0.58)`)
  * Quaternary Label (`--ios-label-quaternary`): **`rgba(60, 60, 67, 0.18)`**
* **Dark Surfaces (SpringBoard Shell, Dark App Headers, Modals)**:
  * Primary Label: Pure White **`#FFFFFF`** (`#F8FAFC`)
  * Secondary Label: Slate **`#94A3B8`** (`rgba(235, 235, 245, 0.60)`)
  * Tertiary Label: Slate **`#64748B`** (`rgba(235, 235, 245, 0.30)`)
  * Quaternary Label: **`rgba(235, 235, 245, 0.18)`**

### 3.6. Typography Universality & App Brand Color Decoupling
As mandated by [Universal Design System SSOT §3.1.1](../../design-system/design.md#311-universal-shared-typography-scale-vs-scoped-app-font-color-invariant):
* **Shared Universals**: The font family (`font-sans`), font scale (`text-ios-*`), weights, line heights, and letter tracking are **strictly shared by all virtual parody apps and the phone shell**.
* **Decoupled Font Color**: Only font colors deviate per parody app according to each app's satirical brand identity (e.g. Zola `#0088FF`, Shopoo `#EE4D2D`, Grap `#00B14F`, Techcombank `#ED1C24`).
* **Zero Arbitrary Classes**: Arbitrary pixel font classes (`text-[10px]`, `text-[11px]`) and standard unmapped Tailwind sizes (`text-xs`, `text-sm`) are strictly banned in virtual app components.

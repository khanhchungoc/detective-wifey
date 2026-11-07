---
type: Universal Design Specification
system_name: Parody Phone OS Universal Design System
topic: accessibility-layout
status: approved
description: "Authoritative accessibility and layout ergonomics specification governing typography boundaries, dynamic type scaling, touch targets, contrast, gutters, safe areas, and viewport geometry."
tags: [accessibility, wcag, typography-scale, touch-targets, layout-grid, gutters, safe-areas, viewport]
timestamp: "2026-10-15T09:20:00+07:00"
---

# Design System - Accessibility, Layout & Ergonomics

> **Parent Design Master**: [design.md](design.md)  
> **Scope**: Universal layout grid, ergonomics, and WCAG accessibility standards across all virtual apps.

---

## 1. Accessibility Standards (WCAG 2.1 AA / AAA Compliance)

To guarantee high legibility, comfort, and cognitive accessibility for all players (ages 13+ across mobile browsers), the system enforces strict accessibility boundaries:

### 1.1. Typography Scale & Font Size Boundaries

All text rendered within the app adheres to these mobile typography boundaries and dynamic scaling rules:

| Boundary / Level | Base Size (REM / PX) | Allowed Usage & Dynamic Scaling Behavior |
|---|---|---|
| **Absolute Lower Floor** | `0.6875rem` ($11\text{px}$) | System badges, battery metrics, minor footnotes. *(Sole exception: $10\text{px}$ / `0.625rem` bold all-caps on dialer mnemonic subtext).* |
| **Secondary Metadata Floor** | `0.8125rem` ($13\text{px}$) | Timestamps, subtitles, photo EXIF, list row snippets. |
| **Primary Body Baseline** | `1.0rem`–`1.0625rem` ($16\text{px}$–$17\text{px}$) | Chat dialogue bubbles, narratives, bank records, and form inputs (prevents iOS Safari auto-zoom). |
| **Section & Modal Headings** | `1.25rem`–`1.375rem` ($20\text{px}$–$22\text{px}$) | In-app headers, modal drawer titles, security lockpad target labels. |
| **Major Title** | `1.75rem` ($28\text{px}$) | Case victory headers, level transition titles, confrontation verdicts. |
| **Base Scale Ceiling** | `2.125rem` ($34\text{px}$) | Default 100% Large Title headers and PIN digits. May scale fluidly up to $200\%$ under user accessibility zoom. |

### 1.2. Typographic Principles & Scaling Governance
- **REM Token Authority**: Relative units (`rem` rooted at `16px = 1.0rem`) serve as the authoritative standard across all CSS tokens to ensure seamless, fluid font scaling without hardcoded pixel clipping.
- **Dynamic Type Scaling Tolerance**: The application layout must support browser dynamic text scaling up to **$200\%$** without text truncation, overflow clipping, or broken layouts (WCAG 1.4.4: Resize Text). Containers must utilize `min-height` and flexbox wrapping rather than fixed heights on text elements.
- **Optical Tracking**: Display titles and headers ($\ge 20\text{px}$) enforce subtle negative tracking (`-0.015em` to `-0.025em`) for visual tightness, while micro-captions ($\le 12\text{px}$) enforce neutral to positive tracking (`+0.01em` to `+0.08em`) to preserve legibility on high-density displays.

### 1.3. Minimum Interactive Touch Target Ergonomics

To prevent mis-taps on mobile devices and satisfy WCAG 2.5.5 (Target Size - Level AAA) and Apple HIG guidelines:

* **Minimum Interactive Hit-Box**: **$44\text{px} \times 44\text{px}$** ($48\text{px} \times 48\text{px}$ recommended for primary action triggers).
* **Transparent Hit-Box Expansion**: If a visible icon atom is $20\text{px}$ or $24\text{px}$, its parent clickable button element must expand padding to reach at least $44\text{px} \times 44\text{px}$:
  ```css
  /* Touch target expansion utility */
  .touch-target-min {
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  ```
* **Inter-Target Spacing Buffer**: A minimum gap of **$\ge 8\text{px}$** must separate adjacent interactive targets.

### 1.4. Contrast Ratios & Legibility Rules

All color pairings must be verified against WCAG 2.1 Level AA and AAA standards:

* **Body Text & Normal Narrative ($< 18\text{px}$)**: Contrast ratio $\ge \mathbf{4.5:1}$ against background canvas. On white/light surfaces (`#FFFFFF` / `#F8FAFC`), secondary and metadata text (`11px`–`15px`) must use `#64748B` ($4.76:1$) or `#52525B` ($7.0:1$); low-contrast grays (`#8E8E93`, `#8A9098`, `#9E9E9E`, `#B4B9BF`) are banned for readable text.
* **Large Text ($\ge 18\text{px}$ bold or $\ge 24\text{px}$ regular)**: Contrast ratio $\ge \mathbf{3.0:1}$.
* **Active UI Components & Graphical Objects**: Contrast ratio $\ge \mathbf{3.0:1}$ against adjacent colors.
* **Focus Not Obscured (WCAG 2.2 AA 2.4.11)**: All scrollable app feeds must include bottom content clearance (`padding-bottom: 6rem` / `scroll-padding-bottom: 6rem`) so sticky bottom tab bars (`z-30`) and persistent floating HUDs (`AssistiveTouch`, `Wife's Notebook FAB` at `z-50`) never obscure the last list row or focused element. Visible focus rings (`outline: 2px solid var(--sys-accent); outline-offset: 2px`) are mandatory on keyboard focus.
* **Wallpaper Legibility Protection**: Any text rendered directly over dynamic wallpapers (e.g. app icon titles, status bar clock) **must enforce** an ambient dark Gaussian drop shadow to preserve contrast across all background tones:
  ```css
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
  ```

### 1.5. Reduced Motion (`prefers-reduced-motion`)

For players sensitive to motion sickness or vestibular disorders:
* When `prefers-reduced-motion: reduce` is detected:
  - Spring-based view slide transitions ($0.25\text{s}$) are replaced with instantaneous opacity crossfades ($0.15\text{s}$).
  - Input error shake oscillations are replaced with an instantaneous border color pulse (`#EF4444`) and haptic/audio cues.
  - Notification toast bounce physics are simplified to a linear fade-in.

---

## 2. Layout Grid, Gutters & Safe Areas

The layout system coordinates fluid responsiveness across native mobile devices and desktop browser bezels.

### 2.1. Base Grid & Spacing Scale
All margins, paddings, and bounds adhere to an **$8\text{px}$ base grid** with a **$4\text{px}$ micro-step** (detailed in [tokens.md](tokens.md#3-spacing-scale)).

### 2.2. Universal Gutters & Safe Margins
* **Standard Viewport Gutter**: **$16\text{px}$** horizontal padding (`px-4` in Tailwind). Applied universally to all screen views, chat lists, settings, and form containers.
* **Dense Media Grid Gutter**: **$12\text{px}$**–$16\text{px}$ screen margin, with **$4\text{px}$**–$8\text{px}$ gap between image tiles (e.g. `PhotosApp`).
* **Card Internal Padding**: **$12\text{px}$** (compact) or **$16\text{px}$** (standard).

### 2.3. Viewport Geometry & Responsive Breakpoints

```
  Desktop Emulated Viewport:          Mobile Native Viewport:
┌───────────────────────────────┐   ┌───────────────────────────────┐
│     Desktop Titanium Bezel    │   │  Full Screen ($100\text{dvh}$) │
│  ┌─────────────────────────┐  │   │  $375\text{px}$–$430\text{px}$│
│  │ Viewport:               │  │   │                               │
│  │ $393\text{px} \times    │  │   │                               │
│  │ $852\text{px}$          │  │   │                               │
│  │ Ratio $\approx 9:19.5$  │  │   │                               │
│  │ (Border Radius: 52px)   │  │   │                               │
│  └─────────────────────────┘  │   │                               │
└───────────────────────────────┘   └───────────────────────────────┘
```

* **Desktop Viewport**: Clamped inside an emulated smartphone bezel at **$393\text{px} \times 852\text{px}$** (aspect ratio $\approx 9:19.5$). Specific chassis geometry is governed by [bezel-shell.md](../apps/phone-os/bezel-shell.md).
* **Mobile Viewport**: Full-bleed responsive fit ($100\%$ width between $375\text{px}$ and $430\text{px}$, $100\text{dvh}$ height).
* **Universal Viewport Height Adaptation**:
  - `xshort` (`max-height: 600px`): Ultra-compact mode. Reduces vertical margins and padding tokens by $25\%$ across all views.
  - `short` (`max-height: 759px`): Compact mode. Standard gutters with condensed header offsets.
  - `tall` (`min-height: 760px`): Standard flagship layout with generous whitespace.
  *(Home Launcher-specific widget and dock scaling are governed by [home-launcher.md](../apps/phone-os/home-launcher.md)).*

### 2.4. Hardware Safe Area Insets

To prevent UI elements from clashing with the camera punch-hole, status chrome, or mobile gesture navigation bars:

* **Top Safe Area Inset**: **$44\text{px}$** (or `env(safe-area-inset-top)`). Dedicated exclusively to the `StatusBar` and Dynamic Island. In-app navigation headers begin at $y = 44\text{px}$.
* **Bottom Safe Area Inset**: **$34\text{px}$** (or `env(safe-area-inset-bottom)`). Houses the home gesture bar indicator. Bottom tab bars and sticky buttons must add $34\text{px}$ bottom padding.
* **Lateral Safe Margins**: Standard $16\text{px}$ left and right gutters protect content from edge clipping.

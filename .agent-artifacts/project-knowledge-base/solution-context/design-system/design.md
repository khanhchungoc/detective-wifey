---
type: Universal Design Specification
system_name: Parody Phone OS Universal Design System
status: approved
description: "Master Universal Design System Hub governing architecture, atomic design principles, token isolation contracts, and legal trade dress."
tags: [design-system, universal-design, atomic-design, master-hub, architecture]
timestamp: "2026-10-15T09:25:00+07:00"
---

# Universal Design System & UI/UX Standards

> **Canonical System SSOT**: This document is the Master Architecture Hub for design principles, token isolation contracts, and specification discovery across the entire application ecosystem.

---

## 1. Modular Specification Index

Detailed standards are decoupled into dedicated child specifications to preserve progressive disclosure:

### 1.1. Universal System Specifications (Shared by All Apps)

| Specification Topic | Canonical Document | Core Governance Scope |
|---|---|---|
| **Core Design Tokens & Colors** | [tokens.md](tokens.md) | Universal semantic colors, 3-tier frosted glass hierarchy, spacing, z-index ladder, and radii. |
| **Accessibility, Layout & Ergonomics** | [accessibility-layout.md](accessibility-layout.md) | WCAG accessibility, typography bounds, dynamic zoom, touch targets, gutters, safe areas, and viewport geometry. |
| **Systemic Behaviors & Motion** | [behaviors-motion.md](behaviors-motion.md) | Navigation gestures, sheet drawers, toast physics, active button states, spring curves, and audio-haptics. |

### 1.2. Phone OS Shell & Native Subsystems

| Subsystem / Topic | Canonical Specification | Architectural Scope |
|---|---|---|
| **Phone OS Master & Shell** | [../apps/phone-os/shell/app-design.md](../apps/phone-os/shell/app-design.md) | Physical titanium chassis, Neural Dynamic Island, 12-app launcher grid, and frosted dock. |
| **Typography & Dynamic Type Scale** | [../apps/phone-os/typography.md](../apps/phone-os/typography.md) | Apple HIG 12-tier dynamic scale, cross-platform Inter font stack, tabular numerals, optical tracking. |
| **Hardware Bezel & Frame** | [../apps/phone-os/bezel-shell.md](../apps/phone-os/bezel-shell.md) | Desktop titanium chassis ($393\text{px} \times 852\text{px}$), Dynamic Island geometry, responsive viewport modes. |
| **Status Bar System Chrome** | [../apps/phone-os/status-bar.md](../apps/phone-os/status-bar.md) | 3-zone layout, zero-carrier invariant, dynamic capsule battery indicator. |
| **Home SpringBoard Launcher** | [../apps/phone-os/home-launcher.md](../apps/phone-os/home-launcher.md) | SpringBoard grid ($4 \times 4$), $2 \times 2$ Detective Smart Stack widget, continuous squircles, frosted dock. |
| **Shared PIN Lockpad** | [../apps/phone-os/pin-lockpad.md](../apps/phone-os/pin-lockpad.md) | Passcode modal barrier, dual-tier dialer typography, PIN dots, error shake physics. |
| **Wife's Investigation Notebook HUD** | [../apps/phone-os/wife-notebook/app-design.md](../apps/phone-os/wife-notebook/app-design.md) | Detective dossier drawer, evidence matrix, suspect tagging, confrontation HUD. |

---

## 2. Atomic Design Principles & Governance

The user interface follows Brad Frost's **Atomic Design** methodology, adapted as an architectural governance model:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ATOMIC DESIGN COMPOSITION FLOW                       │
├────────────────────────────────────────────────────────────────────────┤
│  ATOMS       ──► Primitives & Tokens (Indivisible units)               │
│  MOLECULES   ──► Simple Compositions (Context-agnostic functional units)│
│  ORGANISMS   ──► Modular Subsystems (Self-contained functional blocks) │
│  TEMPLATES   ──► Structural Blueprints (Content-agnostic layouts)      │
│  PAGES       ──► Hydrated Contexts (Runtime case data & player state)  │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Atoms (Primitives)**: Encapsulate raw tokens and foundational visual primitives. System atoms are globally governed and immutable within application contexts; apps consume them directly without defining parallel primitives.
2. **Molecules (Combinations)**: Small, single-responsibility compositions (e.g. icon + label, badge + counter). Stateless or transient UI state only; strictly decoupled from case storylines.
3. **Organisms (Subsystems)**: Self-contained functional sections that orchestrate layout and coordinate child molecules. Universal shell organisms (status bar, lockpad, chassis) operate as shared singletons; parody app organisms mount dynamically within active app viewports.
4. **Templates (Blueprints)**: Content-agnostic structural wireframes defining safe areas, sticky headers, and layout slots without binding to narrative data.
5. **Pages (Hydrated Views)**: Concrete runtime instances where declarative case schemas (messages, banking rows, photos) hydrate templates and connect to detective game state.
6. **Component Reuse-First Mandate**: Audit existing components (`src/components/`, `src/shell/`) before creating new ones. Parallel primitives, ad-hoc styling, and redundant component copies are strictly prohibited.
7. **Authentic App Fidelity Principle (Zero-Spoiler UI Invariant)**: Virtual parody apps must strictly preserve real-world mobile UI fidelity without artificial clue indicators, glowing outlines, or hint badges in default states. Gameplay mechanics (long-press affordances, contextual pinning sheets, suspects board, evidence locker) are application features authoritatively specified in [wife-notebook/features.md](../apps/phone-os/wife-notebook/features.md).

---

## 3. Parody App Token Isolation & Brand Registry

To preserve satirical immersion while enforcing architectural modularity:

### 3.1. Token Separation Contract
* **Universal Standards**: All virtual apps strictly inherit typography, accessibility, gutters, safe areas, motion curves, and semantic status tokens defined in child specifications ([tokens.md](tokens.md), [accessibility-layout.md](accessibility-layout.md), [behaviors-motion.md](behaviors-motion.md)).
* **Isolated Brand Scope**: Each parody app encapsulates its brand styling (palettes, bubble geometry, header gradients, domain layouts) inside its root container (e.g. `.app-zola`, `.app-techcornbank`). Cross-brand token bleed is strictly forbidden.

#### 3.1.1. Universal Shared Typography Scale vs. Scoped App Font Color Invariant
To ensure universal consistency, seamless WCAG 2.1 AA/AAA accessibility scaling, and strict iOS visual fidelity across all applications, typography adheres to this strict separation:
1. **Shared Universals (Immutable Across All Apps)**:
   * **Font Family**: Strictly shared across the entire system via the canonical Apple HIG fallback stack (`font-sans`: `-apple-system`, `BlinkMacSystemFont`, `SF Pro Text`, `SF Pro Display`, `Inter`). Individual apps must never declare custom font families, except `font-mono` (`tabular-nums`) for browser URLs, financial account numbers, and ledger tables.
   * **Font Sizes & Line Heights**: Strictly shared via the 13-tier Apple HIG dynamic scale tokens (`text-ios-*`). All sizes are relative `rem` units rooted at `16px = 1.0rem` to support browser dynamic font scaling up to $200\%$ without clipping.
   * **Font Weights & Optical Tracking**: Bundled directly into the semantic `text-ios-*` tokens (e.g. `text-ios-headline` bundles Semibold $600$ with $-0.025\text{em}$ tracking; `text-ios-caption-2` bundles Semibold $600$ with $+0.01\text{em}$ tracking). Apps must not declare ad-hoc font weights.
   * **Arbitrary Pixel Class Ban**: Arbitrary pixel font classes (e.g. `text-[9px]`, `text-[10px]`, `text-[11px]`) and standard unmapped Tailwind sizes (`text-xs`, `text-sm`, `text-base`) are strictly forbidden inside virtual app implementations.
2. **Allowed App Deviation (Font Color Only)**:
   * **Font Color Is the Sole App-Specific Typographic Property**: Virtual apps are permitted and expected to style font colors to match their brand trade dress (e.g. Zola `#0088FF`, Shopoo `#EE4D2D`, Grap `#00B14F`, Techcombank `#ED1C24` / `#111827`) or semantic surfaces (`text-white`, `text-slate-900`, `text-slate-600`).
   * Color classes are combined directly with semantic typography classes (e.g. `<h2 className="text-ios-headline text-[#EE4D2D]">` or `<p className="text-ios-body text-[var(--color-app-text-primary)]">`).

### 3.2. Canonical Parody App Design Registry

Each virtual application authoritatively owns its brand identity in its dedicated specification:

| App / Subsystem (`app_id`) | Real-World Parody / Metaphor | Authoritative Brand & UI Specification |
|---|---|---|
| **Phone OS Shell & Launcher** (`phone_shell`) | iOS 27 Chassis & SpringBoard | [../apps/phone-os/shell/app-design.md](../apps/phone-os/shell/app-design.md) |
| **Phone** (`phone`) | iOS Phone (Dialer & Recents) | [../apps/phone-os/phone/app-design.md](../apps/phone-os/phone/app-design.md) |
| **Messages** (`messages`) | iOS Messages (SMS Threads) | [../apps/phone-os/messages/app-design.md](../apps/phone-os/messages/app-design.md) |
| **Photos** (`photos`) | iOS Photos (Unified Stream) | [../apps/phone-os/photos/app-design.md](../apps/phone-os/photos/app-design.md) |
| **Zola** (`zola`) | Zalo | [../apps/internet-messaging/app-design.md](../apps/internet-messaging/app-design.md) |
| **Techcornbank** (`techcornbank`) | Techcombank Mobile / VietQR | [../apps/banking/app-design.md](../apps/banking/app-design.md) |
| **Shopoo** (`poshee`) | Shopee | [../apps/ecommerce/app-design.md](../apps/ecommerce/app-design.md) |
| **Grap** (`grap`) | Grab | [../apps/ride-hailing/app-design.md](../apps/ride-hailing/app-design.md) |
| **GeeMail** (`geemail`) | Gmail | [../apps/email/app-design.md](../apps/email/app-design.md) |
| **InkedLin** (`inkedlin`) | LinkedIn | [../apps/professional-network/app-design.md](../apps/professional-network/app-design.md) |
| **Tim** (`tim`) | MS Teams | [../apps/team-collaboration/app-design.md](../apps/team-collaboration/app-design.md) |
| **NetSurf** (`netsurf`) | Safari / Chrome | [../apps/web-browser/app-design.md](../apps/web-browser/app-design.md) |
| **Husband's Notes** (`notes`) | Apple Notes | [../apps/personal-notes/app-design.md](../apps/personal-notes/app-design.md) |
| **Wife's Notebook HUD** (`wife_notebook`) | Detective Dossier HUD | [../apps/phone-os/wife-notebook/app-design.md](../apps/phone-os/wife-notebook/app-design.md) |

---

## 4. Legal & Trade Dress Principles

To maintain legal compliance under fair use and trademark regulations:

* **Strict Prohibition of Non-Ionicons & SF Symbols (Ionicons Only)**: Apple SF Symbols are strictly prohibited on non-Apple operating systems. To preserve mobile trade dress and prevent library fragmentation, **all iconography across the OS shell and parody apps must exclusively use [Ionicons v5](https://ionic.io/ionicons)** (MIT License, outline and filled variants consumed via `react-icons/io5` `Io*` components or standalone Ionicons SVGs). Other icon packs (`react-icons/fa`, `react-icons/md`, `react-icons/lu`, Lucide, FontAwesome) and raw Unicode emojis are strictly forbidden.
* **Open Typography (Inter)**: Web-hosting proprietary Apple `SF Pro` font files (`.woff2`) is prohibited. Systems use client-side OS fallbacks (`-apple-system`) and open-source **Inter**.
* **Parody Brand Deviations**: Direct copying of commercial brand marks is prohibited. All apps feature satirical parody names, altered iconography, and humorous taglines that noticeably deviate from real-world trade dress.
* **Lawful Mobile Trade Dress**: Mobile layout paradigms (frosted glass, squircles, bottom sheets) are uncopyrightable functional patterns safely implemented via open web technologies.

---

## 5. Universal Forensic Long-Press & Evidence Pinning Invariant

To ensure an authentic, un-spoiled detective experience across the virtual phone operating system and all parody applications:

1. **Long-Press Scope (Story Narrative Data Only)**:
   - The universal `380ms` long-press gesture (`StoryEvidenceTarget`) triggering the blurred evidence overlay (`UniversalEvidenceModal`) MUST strictly apply **exclusively to story narrative data dynamically loaded from case JSON (`data.json`)** - e.g. chat messages, call logs, SMS texts, bank transaction memos, order receipts, social posts, and cloud documents.
2. **Keyboard & Screen-Reader Accessibility Alternative (WCAG 2.1 AA)**:
   - Every `StoryEvidenceTarget` is keyboard-focusable (`tabIndex={0}`, `role="button"`) with an accessible label describing the narrative snippet. Pressing `Enter`, `Space`, or the Context Menu key (`Shift+F10`) on a focused `StoryEvidenceTarget` opens `UniversalEvidenceModal` without requiring a timed pointer hold.
3. **Prohibition on App Chrome & Structural Buttons**:
   - Long-press evidence overlays MUST NEVER be attached to static app structure, navigation headers, contact headers, filter pills, search inputs, bottom tabs, or functional utility buttons.
4. **Strict Prohibition of Visible Pin Buttons**:
   - Permanent "Ghim", "Ghim manh mối", or physical Pin buttons are **strictly forbidden** in normal app screens, modals, or detail views. Evidence can ONLY be inspected and pinned to the Wife's Notebook via `StoryEvidenceTarget` on legitimate story data elements.


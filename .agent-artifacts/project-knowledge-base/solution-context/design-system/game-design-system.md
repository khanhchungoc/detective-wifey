---
type: Universal Design Specification
system_name: Game App Design System (Cold War Darkroom & Detective Dossier)
topic: game-design-system
status: approved
description: "Authoritative design system, semantic tokens, tactile materials, lighting, motion vocabulary, and component primitives for all outer Game App surfaces (Startup, Husband Carousel & Level Selector Hub, Level Context & Intro Briefing, Wife's Detective Notebook, Confrontation Room, and Roast Share Cards)."
tags: [design-system, game-ui, tokens, darkroom, dossier, cold-war, tailwind, ui-styling]
timestamp: "2026-11-27"
---

# Game App Design System - Cold War Darkroom & Detective Dossier

> **Canonical Game-UI SSOT**: Promoted from the Detective Evidence Board (`evidence-board/app-design.md`, formerly `wife-notebook`) to serve as the single design system for **all game-level surfaces outside the husband's emulated smartphone**.
>
> **Architectural Boundary**:
> - **Game App World (This Spec)**: Startup Screen (`US-035`), Husband Carousel & Level Selector Hub (`US-036`), Level Context & Interactive Intro Briefing (`US-037`), Detective Evidence Board (`US-015`), Pre-Confrontation Dossier & Interrogation Room (`US-016`), and Shareable Roast Cards (`US-017`).
> - **Husband's Phone World (`phone-os/app-design.md`)**: iOS 27 Phone Shell Lockscreen (`US-038`), SpringBoard Home Grid (`US-002`), Notification Dropdown, and isolated third-party parody apps (`Zola`, `Techcornbank`, `Shopoo`, etc.).

---

## 1. Visual Identity & Aesthetic Philosophy

| Attribute | Specification |
|---|---|
| **Visual Persona** | **Cold War Darkroom Evidence Board & Detective Casefile** (satirical noir inspired by *COD: Black Ops Cold War* dossier rooms). |
| **Atmosphere** | Deep midnight darkroom slate illuminated by a single overhead fluorescent spotlight, contrasted with tactile physical artifacts: aged manila/cream paper, cool-gray Polaroid prints, matte yellow Post-It sticky notes, yellow masking tape, steel/crimson pushpins, and red/yellow investigation yarn. |
| **Visual Contrast Against Phone OS** | Clearly separates the **Wife's Detective World** (tactile paper, darkroom concrete/chalkboard, crimson dossier stamps, `Shantell Sans` handwriting accents) from the **Husband's Smartphone** (clean iOS frosted glass, squircles, bright parody app feeds). |
| **Iconography Invariant** | Strictly **Ionicons v5** (`react-icons/io5` `Io*` or standalone Ionicons SVGs). Raw Unicode emojis and third-party icon packs are prohibited. |

---

## 2. Semantic Design Tokens (`--game-*`)

Feature code MUST consume these CSS variables or Tailwind `@theme` utilities. Hardcoded hex codes and arbitrary pixel values (`bg-[#...]`, `text-[13px]`) are prohibited in game components.

### 2.1. Darkroom Surfaces & Spotlight Backdrop

| Token Name | Hex / Value | Semantic Role & Usage |
|---|---|---|
| `--game-backdrop` | `#080B0F` | Deep Midnight outer shell, fullscreen startup & interrogation stage backdrop |
| `--game-canvas` | `#0F151D` | Darkroom Slate primary canvas (Level Selector Hub, Corkboard chalkboard, Briefing stage) |
| `--game-dossier` | `#141A22` | Sealed Darkroom Casefile folder surface (level cards, dossier modals, subtitle cards) |
| `--game-surface-elevated` | `#1B2330` | Elevated interactive panels, confirmation modals, inactive D-pad choice cards |
| `--game-hairline` | `rgba(255, 255, 255, 0.12)` | Subtle darkroom borders, folder seams, dividers |

### 2.2. Tactile Paper, Polaroid & Sticky Note Surfaces

| Token Name | Hex / Value | Semantic Role & Usage |
|---|---|---|
| `--game-paper` | `#F5F1E8` | Aged Light Paper for evidence cards, case briefing sheets, and roast card body |
| `--game-paper-border` | `#C9BFAE` | Aged Paper Edge hairline border |
| `--game-paper-slip` | `#EAEFF4` | Cool-gray ledger slip for unplaced clue drawer rows and dossier evidence lists |
| `--game-polaroid` | `#EEF2F6` | Cool Polaroid matte card stock (Husband Carousel portraits, Suspect Polaroids) |
| `--game-film-frame` | `#FBFAF7` | Photo Matte White instant-film border frame |
| `--game-sticky-note` | `#F6E271` | Matte Post-It yellow tab for card titles, `"Đề xuất"` tutorial tag, and wife notes |
| `--game-tape` | `#D4B44C` | Cold War masking tape accent holding Polaroids and paper briefings |

### 2.3. Ink & Typography Colors

| Token Name | Hex / Value | Semantic Role & Contrast Target |
|---|---|---|
| `--game-text-primary` | `#F8FAFC` | Primary high-contrast text on darkroom surfaces (>= 14:1 on `#0F151D`) |
| `--game-text-secondary` | `#94A3B8` | Subtitles, metadata, timestamps, lock hints on darkroom surfaces (>= 6:1) |
| `--game-text-muted` | `#64748B` | Version tags, inactive captions, disabled labels |
| `--game-ink-primary` | `#0F172A` | Deep Slate primary ink on aged paper, Polaroids, and sticky notes (>= 12:1) |
| `--game-ink-secondary` | `#475569` | Secondary metadata ink on paper and Polaroid captions (>= 6:1) |

### 2.4. Semantic, Verdict & Investigation Accents

| Token Name | Hex / Value | Semantic Role & Usage |
|---|---|---|
| `--game-crimson` | `#E11D48` | Primary CTA pills (`CHẠM ĐỂ BẮT ĐẦU`, `BẮT ĐẦU ĐIỀU TRA`, `Đối chất`), dossier left spine, active progress beacon |
| `--game-crimson-deep` | `#DC2626` | Critical smoking-gun yarn, red dossier stamps (`NGHI PHẠM`, `BẮT QUẢ TANG`), strike alerts |
| `--game-amber` | `#FBBF24` | Earned star ratings, neutral investigation yarn, `"Giác quan thứ 6"` highlight, warning badges |
| `--game-emerald` | `#22C55E` | Completed level checkmarks (`Đã hoàn thành`), verified innocence, success confirmation |

### 2.5. Tailwind CSS `@theme` Mapping

```css
@theme {
  /* Darkroom Surfaces */
  --color-game-backdrop: #080B0F;
  --color-game-canvas: #0F151D;
  --color-game-dossier: #141A22;
  --color-game-elevated: #1B2330;

  /* Tactile Paper & Polaroids */
  --color-game-paper: #F5F1E8;
  --color-game-paper-border: #C9BFAE;
  --color-game-paper-slip: #EAEFF4;
  --color-game-polaroid: #EEF2F6;
  --color-game-film-frame: #FBFAF7;
  --color-game-sticky: #F6E271;
  --color-game-tape: #D4B44C;

  /* Ink & Text */
  --color-game-text: #F8FAFC;
  --color-game-text-secondary: #94A3B8;
  --color-game-text-muted: #64748B;
  --color-game-ink: #0F172A;
  --color-game-ink-secondary: #475569;

  /* Accents */
  --color-game-crimson: #E11D48;
  --color-game-crimson-deep: #DC2626;
  --color-game-amber: #FBBF24;
  --color-game-emerald: #22C55E;

  /* Handwriting Accent Font */
  --font-handwriting: 'Shantell Sans', cursive, sans-serif;
}
```

---

## 3. Typography & Ergonomics Governance

- **Universal Scale Inheritance**: All readable UI headings, buttons, level descriptions, and dialogue text strictly inherit the universal `font-sans` stack and 12-tier Apple HIG dynamic scale (`text-ios-*`) from [tokens.md](tokens.md#6-apple-hig-dynamic-typography-scale-tokens). `font-mono` and arbitrary pixel text classes are prohibited.
- **Handwriting Accent (`font-handwriting`)**: Self-hosted **Shantell Sans** (`@fontsource/shantell-sans`, full Vietnamese diacritic support) is reserved strictly for:
  - Sticky-note titles and `"Đề xuất"` / wife doodle tags (`.game-sticky-note`)
  - Handwritten Polaroid captions (e.g., husband nickname on Husband Carousel Polaroid)
  - Corkboard chalk annotations
- **Touch Targets & Gutters**: Inherits [accessibility-layout.md](accessibility-layout.md): minimum `44x44px` interactive targets (`.touch-target-min`), `16px` (`px-4`) standard horizontal gutter, `8px` spacing rhythm, and `375px-430px` mobile-first portrait layout (centered desktop frame).

---

## 4. Signature Materials & Lighting Primitives

1. **Overhead Fluorescent Spotlight (`FluorescentLampHighlight`)**:
   - Single overhead light source (`50% 0%`) casting a radial wash over the darkroom backdrop (`#080B0F` / `#0F151D`) with natural dark edge vignettes.
   - Brief ignition flicker (`0.85s`) on screen mount, followed by subtle ambient double-dip (`0.42s`, every `8.5s`) animating `opacity` only (`will-change-[opacity]`).
   - Collapses to static lighting under `prefers-reduced-motion: reduce`.
2. **Darkroom Chalkboard Backdrop**:
   - Pre-rasterized `chalkboard-map.png` texture over `#0F151D` with soft chalk-eraser wipes and muted wife-detective doodles.
3. **Physical Polaroid Frame (`.game-polaroid-card`)**:
   - `#EEF2F6` / `#FBFAF7` matte border with wider bottom caption chin, subtle `-2deg` or `-3deg` tilt, optional `#D4B44C` masking tape strip or `#DC2626` pushpin at top center, and soft paper drop shadow.
4. **Crimson-Spined Casefile Folder (`.game-dossier-card`)**:
   - `#141A22` darkroom folder container with a `3px-4px` `#E11D48` left crimson spine, subtle `rgba(255,255,255,0.12)` border, and top-right folder tab label (e.g., `FILE 01`, `MÀN 1`).
5. **Aged Paper Briefing Sheet (`.game-paper-card`)**:
   - `#F5F1E8` lightly textured paper surface with `#C9BFAE` border and `#0F172A` / `#475569` dark ink for high-legibility case briefings, evidence cards, and roast printouts.
6. **Sticky Note Badge (`.game-sticky-note`)**:
   - `#F6E271` matte yellow paper tab with `-1.5deg` tilt, `#0F172A` `font-handwriting` text, used for card titles and `"Đề xuất"` first-play highlights.
7. **Embossed Verdict Stamp (`.game-stamp`)**:
   - Rotated (`-6deg` to `-10deg`) uppercase `#DC2626` or `#22C55E` bordered stamp (`BẮT QUẢ TANG`, `ĐÃ HOÀN THÀNH`, `SẮP RA MẮT`).

---

## 5. Motion & Interaction Vocabulary

Promoted from `confrontationMotion.ts` to govern all Game App transitions:

| Motion Primitive | Curve / Timing | Approved Usage |
|---|---|---|
| `NARRATIVE_IN` | `240ms` ease-out (`opacity` + subtle `translateY`) | Dialogue beats, husband mood shifts, spotlight reveals, briefing sheet entrance |
| `NARRATIVE_OUT` | `160ms` ease-in (~0.7x entrance) | Dismissing dialogue beats, exiting startup into Level Selector Hub |
| `SNAP` Spring | `stiffness: 400, damping: 40, mass: 1` (0% overshoot) | Husband Carousel swipe snapping, D-pad cluster reveal, drawer open/close |
| `POP` Spring | `stiffness: 400, damping: 26, mass: 1` (~6.8% overshoot) | Stamping verdicts, unlocking a level, evidence hit recoil on husband |
| Tactile Press | `active:scale-[0.97] active:opacity-75` (`85ms`) | All primary CTAs, level dossier cards, carousel arrows, D-pad choices |
| Reduced Motion | `150ms` opacity crossfade only | Mandatory fallback when `prefers-reduced-motion: reduce` is active |

---

## 6. Screen-by-Screen Application Map

| Game Screen | Primary Surface & Lighting | Signature Components Reused |
|---|---|---|
| **Startup (`US-035`)** | `--game-backdrop` (`#080B0F`) + overhead spotlight cone | Crimson progress bar (`--game-crimson`), embossed emblem/title, `"CHẠM ĐỂ BẮT ĐẦU"` crimson pill CTA |
| **Level Selector Hub (`US-036`)** | `--game-canvas` (`#0F151D`) darkroom chalkboard | Swipeable **Polaroid Husband Carousel** (`.game-polaroid-card` + masking tape + handwritten caption), **Crimson-Spined Casefile Level Cards** (`.game-dossier-card`), yellow **Sticky Note** `"Đề xuất"` tag on Level 0, amber star ratings (`--game-amber`), lock/stamp states |
| **Level Context & Intro Briefing (`US-037`)** | Spotlight stage (`#080B0F`) -> Casefile Briefing (`#0F151D`) | Spotlight Husband portrait + darkroom subtitle card (`--game-dossier`) for 2-3 tap intro dialogue; **Aged Paper Briefing Sheet** (`.game-paper-card`) + Husband Polaroid + `"BẮT ĐẦU ĐIỀU TRA"` crimson CTA |
| **Wife's Detective Notebook (`US-015`)** | `--game-canvas` (`#0F151D`) + `chalkboard-map.png` + `FluorescentLampHighlight` | `.game-paper-card` evidence nodes, `.game-sticky-note` titles, `.game-film-frame` avatars, red/yellow yarn strings, `UnorganizedDrawer` (`.game-paper-slip`) |
| **Confrontation Room (`US-016`)** | `--game-backdrop` (`#080B0F`) + volumetric spotlight | `ConfrontationConfirmModal` (`.game-dossier-card` + Polaroid face-off), `HusbandCharacterImage`, `- • -` progress rail, COD Cold War D-pad |
| **Shareable Roast Card (`US-017`)** | Vertical 9:16 darkroom dossier printout | `.game-paper-card` + Polaroid husband mugshot + `.game-stamp` verdict + Wife Title + amber stars |

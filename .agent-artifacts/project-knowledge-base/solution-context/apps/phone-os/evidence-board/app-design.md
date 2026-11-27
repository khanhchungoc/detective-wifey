---
type: App Design Specification
app_id: evidence_board
app_name: Detective Evidence Board & Confrontation Hub
vietnamese_name: Bảng Bằng Chứng (formerly Sổ Tay Bắt Ghen)
status: approved
description: "UI/UX layouts for the Cold War darkroom Detective Evidence Board (corkboard), universal evidence pinning menu, and Confrontation Room, inheriting tokens from Game App Design System."
tags: [app-design, evidence-board, wife-notebook, suspect-board, evidence-locker, verdict-hub, ui-ux, design-system, branding]
timestamp: "2026-11-27"
---

# Bảng Bằng Chứng (Detective Evidence Board) - App Design & UI/UX Specification

> **Design System Reuse & Inheritance**:
> Bảng Bằng Chứng consumes its Cold War Darkroom color palette (`--game-*`), aged paper/Polaroid/sticky-note materials, overhead fluorescent spotlight lighting, and `SNAP`/`POP` motion vocabulary directly from the canonical [Game App Design System](../../../design-system/game-design-system.md), while inheriting container dimensions, `.glass-elevated` modal backdrops, and `>= 44x44px` touch target standards from [Phone OS Master Design](../app-design.md). This document defines the corkboard, evidence pinning menu, and confrontation layouts.

---

## 1. Brand Identity & Parody Theme

| Attribute | Specification |
|---|---|
| **Feature Name** | **Sổ Tay Bắt Ghen** (*Wife's Detective Notebook & Final Decision Hub*) |
| **Slogan / Tagline** | *"Lưới trời lồng lộng - Tay vợ khó thoát"* |
| **Real-World Parody** | Detective Case Dossier / Marital Journal |
| **Visual Persona** | Cold War Darkroom Evidence Board (inspired by *COD: Black Ops Cold War*). Styled like a darkroom slate chalkboard under overhead fluorescent light with dusty eraser wipes, wife-detective chalk doodles, cool-gray physical paper evidence cards pinned with yellow masking tape and steel/crimson pins, and red/yellow yarn connections. |
| **Architectural Role** | Omnipresent compact right-edge-docked forensic tab on the virtual phone shell container, inheriting Phone OS floating button tokens. Accessible from any screen via `NotebookTab` (`46×52px` flush to the right edge, `rounded-l-[12px] rounded-r-none`, `#0B1017` single-surface with subtle `border-white/15` hairline, `IoJournalOutline`, and top-left circular evidence counter badge; case number exposed via `aria-label`) or the phone shell Notification Dropdown (`US-038`). |

---

## 2. Visual Design System & Color Tokens

```
┌────────────────────────────────────────────────────────┐
│       COLD WAR DARKROOM EVIDENCE COLOR PALETTE         │
├────────────────────────────────────────────────────────┤
│ Backdrop / Shell:     Deep Midnight    #080B0F         │
│ Board Canvas:         Darkroom Slate   #0F151D         │
│ Evidence Paper Card:  Aged Light Paper #F5F1E8         │
│ Polaroid Paper:       Cool Polaroid    #EEF2F6         │
│ Film Photo Frame:     Photo Matte White #FBFAF7        │
│ Sticky Note Title:    Matte Post-It    #F6E271         │
│ Paper Border:         Aged Paper Edge  #C9BFAE         │
│ Masking Tape Accent:  Cold War Tape    #D4B44C         │
│ Casefile Sheet:       Darkroom Folder  #141A22         │
│ Card Primary Text:    Deep Slate       #0F172A         │
│ Card Metadata Text:   Slate Secondary  #475569         │
│ Contradiction / CTA:  Crimson Alert    #E11D48 / #DC2626│
│ Innocent / Verified:  Emerald Signal   #22C55E         │
│ Neutral String:       Evidence Yellow  #FBBF24         │
└────────────────────────────────────────────────────────┘
```

* **Canvas Material**: Deep darkroom chalkboard (`#0F151D`) with no independent static light sources - lit solely by the single overhead fluorescent lamp, framed by a natural dark edge/bottom vignette. The surface uses `chalkboard-map.png` (`720x720` pre-rasterized PNG) featuring chalk-eraser dust wipes and tilted wife-detective chalk doodles (husband sketch marked `"PHẢN BỘI!"` / `"PHỤ BẠC"`, shopping bags, dining plates, messaging bubbles, magnifying glass, late-night clock).
* **Single Overhead Fluorescent Lamp Motion (`FluorescentLampHighlight` via `motion/react`)**:
  * **Startup Ignition & Ambient Flicker**: On notebook open, the overhead fluorescent tube runs a brief ignition flicker (`0.85s`) followed by a subtle periodic ambient double-dip (`0.42s`, `[1, 0.45, 0.94, 0.62, 1]`) every `8.5s` (`repeatDelay: 8.5`) so the board remains steady ~95% of the time for comfortable reading.
  * **Unified Full-Board Lighting & Dimming**: A `z-0` full-board radial light wash (`inset-0`) emanating from the overhead tube (`50% 0%`) animates 1:1 with the tube, while an inversely synced `z-[25]` full-board dimming veil (`roomDimmerEl`, inside an `isolate` canvas container so it never dims the bottom dock or `z-40` banners) darkens the entire board, yarn strings, and pinned evidence cards in lockstep whenever the lamp dips.
  * **Performance & Accessibility**: Animates `opacity` only (`will-change-[opacity]`, never `box-shadow`) and falls back to static lighting when `useReducedMotion()` (`prefers-reduced-motion`) is active.
* **Physical Paper Cards**: Evidence cards on the board (`.corkboard-paper-card`, `#F5F1E8`, `#C9BFAE` border, `#0F172A` text) use a light crumpled, lightly stained aged-paper texture (subtle fold creases, soft tea-stain blotches, and paper fiber noise; no dot grid) so dark ink and yellow sticky notes maintain crisp contrast against the darkroom board. Each card's title is separated onto a borderless matte yellow sticky note tab (`.corkboard-sticky-note`, `#F6E271`, `-1.5deg` tilt, soft paper-lift shadow) overlapping the top-left corner and rendered in the self-hosted **Shantell Sans** handwriting font (`font-handwriting` / `.corkboard-sticky-note h4` via `@fontsource/shantell-sans`); when the card has a contact avatar, it sits inside an attached square white-bordered film photo frame (`.corkboard-film-frame`, `#FBFAF7`, `-3deg` tilt, `ContactAvatar` `shape="square"`) alongside the sticky note with its source app badge. Cards are pinned with yellow masking tape (`#D4B44C`) and steel/crimson marker pins at top center. Inside `UnorganizedDrawer`, unplaced slips retain compact `#E6EBF0` / `#B8C4D0` list styling.
* **Confrontation Dossier**: Sealed darkroom casefile (`#141A22`) with a crimson left spine (`#E11D48`), cool-gray physical Polaroid frames (`#EEF2F6` / `#E6EBF0`), and cool-gray evidence ledger slips (`.dossier-paper-card`, `#EAEFF4`).

* **Typography (Universal `text-ios-*` Tokens + Handwriting Accent)**:
  * Notebook Header: `text-ios-footnote` / `font-sans` uppercase (`#F1F5F9` on darkroom header `#090C10` - `#111722`).
  * Sticky Note Card Title: `font-handwriting` (`'Shantell Sans', cursive, sans-serif` self-hosted via `@fontsource/shantell-sans`, $10\text{px}$ Medium, `#0F172A`, Vietnamese-supported).
  * Suspect Polaroid / Dossier Title: `text-ios-callout` ($16\text{px}$ Semibold, `#0F172A`).
  * Node Snippet & Metadata: `text-ios-footnote` ($13\text{px}$ Regular, `#475569`, contrast $\ge 4.5:1$).
  * Confrontation CTA & Sixth Sense Trigger: `text-ios-headline` ($17\text{px}$ Semibold).
* **Ergonomics & Touch Targets**:
  * Right-edge-docked floating tab (`NotebookTab`, $46 \times 52\text{px}$ flush to right edge, satisfying $\ge 44 \times 44\text{px}$ touch target) with circular unplaced clue counter badge (`-left-1.5 -top-1.5`).
  * All header buttons (`[Đóng]`, `[Giác quan thứ 6]`, `[Đối chất]`) and node `[Loc]` deep-link buttons enforce $\ge 44 \times 44\text{px}$ touch targets (`.touch-target-min`).

---

## 3. UI Wireframes & Layout Architecture

### 3.1. Contextual Long-Press Pinning Menu (`UniversalEvidenceModal` - US-011)

> **Trigger**: Long-press ($\ge 380\text{ms}$) or keyboard `Enter`/`Space` on any interactive story narrative element (`StoryEvidenceTarget`) in any parody app.  
> **Backdrop & Placement**: Blurred dimmed scrim (`bg-black/60 backdrop-blur-md`) with the selected narrative target visually highlighted above the scrim (`ring-2 ring-white/75`) and a compact `.glass-elevated` dark context menu (`--sys-surface-elevated` / `rgba(15, 23, 42, 0.90)`, `rounded-[16px]`, `role="dialog"`, `aria-modal="true"` with focus trap) anchored beneath (or above/centered when near edges). Dismisses on backdrop tap or `Escape`.
> **Pinned Marker State**: After pinning, `StoryEvidenceTarget` displays a non-interactive red circular bookmark badge (`#EF4444` with white Ionicons `IoBookmark`) synced across all apps; re-triggering on a pinned item switches the action row to `"Bỏ ghim khỏi Sổ tay"`.

```
┌────────────────────────────────────────────────────────┐
│ (Blurred dimmed backdrop over underlying app screen)   │
│                                                        │
│ ╔════════════════════════════════════════════════════╗ │
│ ║ "Tối nay 20h48 anh qua kiểm tra đường điện nhé!"   ║ │ <- Highlighted target
│ ╚════════════════════════════════════════════════════╝ │
│ ┌────────────────────────────────────────┐             │
│ │ Tối nay 20h48 anh qua kiểm tra đường...│             │ <- text-ios-subheadline (#FFF)
│ │ Zola · 15/10 · 20:48                   │             │ <- text-ios-footnote (#94A3B8)
│ ├────────────────────────────────────────┤             │
│ │ Ghim vào Sổ tay            [IoBookmark]│             │ <- Single ≥44px action row
│ └────────────────────────────────────────┘             │    (or "Bỏ ghim khỏi Sổ tay")
└────────────────────────────────────────────────────────┘
```

---

### 3.2. Detective Corkboard Node Canvas & "Giác Quan Thứ 6" Hint Header (`WifeNotebookModal` - US-015, US-022, US-033)

> **Layout**: Fullscreen overlay (`z-50`) featuring a full-bleed darkroom 2D interactive red-string chalkboard (`CorkboardCanvas`), a compact top-right floating stats overlay pill (`[IoDocumentsOutline (#F1F5F9) <nodes> · IoGitBranchOutline (#E11D48) <verifiedKey>/<requiredKey>]`, counting only required smoking-gun key connections such as `2/2` in Level 1 and ignoring non-key edges, `36px` visual height / `44×44px` touch target, triggering `[Định vị]` cluster centering), a split bottom floating control bar (`36px` visual height / `44×44px` touch target: `[Đóng]` / Back icon on the left; icon-only `[Xếp gọn]` + primary `#E11D48` pill `[Đối chất]` on the right), and the slide-over unplaced clue drawer (`UnorganizedDrawer`).

```
┌────────────────────────────────────────────────────────┐
│ [Close] Đóng            SỔ TAY             [MiniMap]   │
│ [Sparkles] Giác quan thứ 6 (00:30)     [Đối chất]      │
├────────────────────────────────────────────────────────┤
│ [AppIcon] Xem [Tên ứng dụng].    [ [Home] Về màn chính]│
├────────────────────────────────────────────────────────┤
│   ┌────────────────────┐        ┌────────────────────┐ │
│   │ [Mask] VỎ BỌC [Loc]│        │ [Phone] SĐT  [Loc] │ │
│   │ "Anh Tuấn Thợ Điện"│══(Vàng)═╡ 0988886677         │ │
│   │ [Zola] 23:44       │        │ [Phone] [Shopoo]   │ │
│   └────────────────────┘        └─────────┬──────────┘ │
│                                           │ (Vàng)     │
│                                 ┌─────────▼──────────┐ │
│                                 │ [Target] THỦ PHẠM  │ │
│                                 │ Nguyễn Thu Hương   │ │
│                                 └────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ TIẾN ĐỘ ĐIỀU TRA: [||||||||||||||] 2/3 Bằng chứng cốt lõi│
│ [Zoom: -] [100%] [Zoom: +]  [Auto-Arrange]  [Center]   │
├────────────────────────────────────────────────────────┤
│ [Drawer: ^] KHAY MANH MỐI MỚI (2 thẻ chưa đưa lên bảng)│
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Card: SMS 1900] [Đưa lên bảng] [ [Loc] Tới nguồn ]│ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

* **Yarn String Visual Types (`CorkboardCanvas`)**:
  * **Critical / Key Evidence (`contradicts_alibi` or verified smoking-gun / required key connection)**: Red solid (`#DC2626`), representing the highest-priority contradiction or key smoking-gun links (matching the top-right key connection counter).
  * **Neutral (All other connections)**: Yellow solid (`#FBBF24`, solid line), representing supporting or speculative links.
  * **Opacity**: Default `0.55` (shadow `0.18`) so text on underlying cards remains legible when strings cross over them.
  * **Selected State**: Preserves the edge's type color while increasing stroke weight (`2.75`) and opacity (`0.85`).
* **Crisp Canvas Zoom Architecture (`CorkboardCanvas`)**:
  * **Decoupled Pan & Zoom**: Panning uses `transform: translate(...)` on the outer camera wrapper, while zooming (`0.5x`-`2.0x`) uses CSS `zoom` on the inner `1800×1800` virtual plane - **never** `transform: scale(...)` on the plane containing tilted (`rotate(...)`) evidence cards. Combining `transform: scale(...)` with nested card `rotate(...)` causes the browser to rasterize cards at `1x` and upscale them as blurry bitmaps when zoomed in; CSS `zoom` ensures text, borders, and SVG yarn strings re-rasterize crisply at the target DPI.
* **"Giác Quan Thứ 6" (Sixth Sense) Hint States ([wireframe-sixth-sense.md](../../../../requirements/output/epic-02-investigation-suspicion-mechanics/wireframes/wireframe-sixth-sense.md))**:
  * **Ready**: `[Sparkles] Giác quan thứ 6` (`IoSparklesOutline`). Free on-demand hint.
  * **Uncollected Clue Exists**: Displays banner `[AppIcon] Xem [Tên ứng dụng]. [Về màn hình chính]`. Tapping `[Về màn hình chính]` returns to SpringBoard and highlights the target app icon (max 2 pulses then static ring) without opening the app or spoiling the exact clue inside.
  * **All Required Clues Collected (Unsolved Graph)**: Displays general reminder `[Book] Xem lại các mối liên hệ.` without revealing the correct card pair. Counts as a valid hint use and starts cooldown.
  * **30-Second Real-Time Cooldown**: Displays `[Time] 00:24` (`IoTimeOutline`, `tabular-nums`, persisted across notebook close/reopen and reloads). Under `prefers-reduced-motion`, shows static timer digits without spinning ring or per-second screen-reader chatter.
* **Source Deep-Link (`[Loc]` / `IoNavigateOutline`)**: Tapping `[Loc]` on any node or drawer card jumps directly to the source app and message/record while minimizing the notebook into a top floating banner (`[Pill: QuayLaiSoTay] Quay lại Sổ tay Điều tra`, `z-70`, `#E11D48`).

---

### 3.3. Pre-Confrontation Dossier (`ConfrontationConfirmModal`), Interrogation Room & Shareable Roast Card (`ConfrontationModal` - US-016, US-017)

> **Preflight Dossier (`ConfrontationConfirmModal`, `z-75`)**: Before launching confrontation, tapping `[Đối chất]` opens a two-step Darkroom Casefile Dossier modal styled consistently with the Cold War board (`#141A22` darkroom folder, `#E11D48` left spine, `FILE 01` tab, cool-gray `#EEF2F6` Polaroids & `#EAEFF4` evidence slips, red stamps, `font-sans` uppercase labels):
>   1. **Step 1 (Suspect Selection)**: Polaroid suspect cards on `.suspect-cork-tray` with 3D red pushpins and `"NGHI PHẠM"` / `"ĐÃ LỘT MẶT NẠ"` stamps.
>   2. **Step 2 (Confrontation Confirmation)**: Tilted Polaroid face-off (Husband vs Suspect) linked by a red string, 5-segment conviction strength indicator (`Tỉ lệ thành công`), **Deductive Linkage Bridges** (`verifiedStringsList` pairing connected clues via relationship bridge badges instead of raw text lists), and a red embossed dossier stamp CTA (`MÀY DÁM LỪA BÀ!`).
>
> **Interrogation Room & COD Cold War D-Pad (`ConfrontationModal`, `z-80`)**: Fullscreen 3-tier vertical interrogation room (`max-w-[480px] h-[100dvh]`, `#080B0F` / `#0B1017` dark concrete stage) driven by `caseConfig.confrontationScript` (with automatic fallback to tiered evaluation when `confrontationScript` is absent):
>   1. **Top Tier (Noir Spotlight Stage & Comic Portrait)**: Industrial overhead lamp casting a volumetric top-down spotlight cone (`transform` + `opacity` compositor-only pulse) onto `HusbandCharacterImage` (`hoang-comic-{confident,smug,nervous,broken}.svg` modeled on the OS wallpaper persona), flanked by a `44x44px` close button, discrete header (`ĐỐI CHẤT · HOÀNG`), and `usedStrikes/maxStrikes` pill.
>   2. **Middle Tier (`- • -` Progress Rail & Subtitle Card)**: Elastic minimalist `- • -` progress indicator (`role="progressbar"`, completed steps as `-` dashes, active step as glowing `•` dot, upcoming steps as muted `-` dashes), current beat `topic` header, and a darkroom subtitle card (`font-sans`, `text-ios-callout` / `text-ios-body`, zero hardcoded narrative strings).
>   3. **Bottom Tier (COD Cold War Cross / D-Pad Selector)**: Central `44x44px` vector tactical reticle (`ColdWarReticleSvg` highlighting active cardinal ticks) surrounded by `up` / `left` / `right` / `down` choice buttons (`min-h-[48px]` to `min-h-[54px]`, `text-ios-footnote` / `text-ios-subheadline`, supporting desktop `ArrowUp`/`ArrowRight`/`ArrowDown`/`ArrowLeft` and `Escape` keys plus `useSwipeBack`).

```
┌────────────────────────────────────────────────────────┐
│ [X]              ĐỐI CHẤT · HOÀNG          [Scale 0/5] │
│                   ▄▄▄▄▄▄▄▄▄▄▄▄▄▄                       │
│                ╱   (Spotlight)    ╲                    │
│               ╱  [ Comic Hoàng ]   ╲                   │
│              ╱  (confident->broken) ╲                  │
├────────────────────────────────────────────────────────┤
│                     -  •  -  -                         │
│              ANH TUẤN THỢ ĐIỆN LÀ AI?                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Vợ: "Hoàng, anh có gì lừa dối tôi không?"        │  │
│  │──────────────────────────────────────────────────│  │
│  │ Hoàng                             Khoanh tay     │  │
│  │ "Lừa dối gì? Anh họp tới tối mịt mới về..."      │  │
│  └──────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│       ┌────────────────────────────────────────┐       │
│       │ Thợ điện nào dùng chung số 0988886677? │ [^]   │
│       └────────────────────────────────────────┘       │
│  ┌───────────────────┐  ( + )  ┌────────────────────┐  │
│  │ Thảo PT nhắn [<]  │ Reticle │ [>] Lan Anh đòi... │  │
│  └───────────────────┘         └────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

* **Confrontation Motion Vocabulary (`confrontationMotion.ts` & `HusbandCharacterImage.tsx`)**:
  * **Narrative vs Responsive**: System-driven dialogue, mood cross-fades, and spotlight shifts use `NARRATIVE_IN` (`240ms` ease-out) and faster `NARRATIVE_OUT` (`160ms`, ~0.7x entrance). Direct button touches use `active:scale-[0.97] active:opacity-75` (`85ms`) and `useSwipeBack`.
  * **Two-Spring Discipline**: `SNAP` (`stiffness: 400, damping: 40, mass: 1`, 0% overshoot) drives D-pad cluster transitions with `40ms` stagger across up to 4 buttons; `POP` (`stiffness: 400, damping: 26, mass: 1`, ~6.8% overshoot <= 8%) is reserved strictly for critical evidence hit recoil on Hoàng (`hitTrigger`) and stamping the final `End` verdict badge.
  * **Compositor & Accessibility Guardrails**: Animates exclusively `transform` and `opacity` (idle breathing, hit recoil, `broken` micro-tremble, spotlight pulse) and collapses all spatial motion to `150ms` opacity cross-fade under `useReducedMotion()`.
* **Scripted Branching & Legacy Fallback Outcomes**:
  * **Scripted False Branch (`phase: 'failed'`, `husbandMood: 'smug'`)**: Selecting a red herring, accusing the wrong suspect, or lacking any required canonical edge (`requiredEdgeIds`) triggers Hoàng's `smug` rebuttal, locks `canAccuse = false` (zero accusation/verdict buttons rendered), displays only `[Quay lại điều tra]`, and deducts **+1 strike** upon exiting the room.
  * **Scripted True Chain -> `End` (`confident -> nervous -> broken -> ending -> resolved`)**: Clearing every beat unlocks `script.ending` choices on the D-pad (e.g., divorce vs forgive), then stamps the case verdict (`BẮT QUẢ TANG NGOẠI TÌNH` / `VẠCH TRẦN SUGAR DADDY` / `MINH OAN CHỒNG VÔ TỘI`), 3 stars, Wife Title, comedic roast, `[Tạo thẻ Roast khoe MXH]`, and level progression CTA.
  * **Fallback Tiered Mode (Levels without `confrontationScript`, e.g. Level 2 & Level 3)**: Retains M1 (0 stars + 1 strike), M2 (1-2 stars partial conviction), and M3 (3 stars full confession).

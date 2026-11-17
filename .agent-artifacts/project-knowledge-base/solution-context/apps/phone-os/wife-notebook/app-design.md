---
type: App Design Specification
app_id: wife_notebook
app_name: Wife's Detective Notebook & Final Decision Hub
vietnamese_name: Sổ Tay Bắt Ghen Của Vợ
status: approved
description: "Branding, UI/UX visual design system, color tokens, typography, and wireframe layouts for the Wife's Detective Notebook & Final Decision Hub."
tags: [app-design, wife-notebook, suspect-board, evidence-locker, verdict-hub, ui-ux, design-system, branding]
timestamp: "2026-10-14T13:00:00+07:00"
---

# Sổ Tay Bắt Ghen Của Vợ - App Design & UI/UX Specification

> **Design System Reuse & Inheritance**:
> Sổ Tay Bắt Ghen Của Vợ inherits the global [Phone OS Master Design System](../app-design.md) for its physical container dimensions, `.glass-elevated` modal sheet backdrop blur, AssistiveTouch integration, and touch target standards ($\ge 44 \times 44\text{px}$). This document defines the domain-specific Cold War darkroom evidence board visual overlay.

---

## 1. Brand Identity & Parody Theme

| Attribute | Specification |
|---|---|
| **Feature Name** | **Sổ Tay Bắt Ghen** (*Wife's Detective Notebook & Final Decision Hub*) |
| **Slogan / Tagline** | *"Lưới trời lồng lộng - Tay vợ khó thoát"* |
| **Real-World Parody** | Detective Case Dossier / Marital Journal |
| **Visual Persona** | Cold War Darkroom Evidence Board (inspired by *COD: Black Ops Cold War*). Styled like a darkroom slate chalkboard under overhead fluorescent light with dusty eraser wipes, wife-detective chalk doodles, cool-gray physical paper evidence cards pinned with yellow masking tape and steel/crimson pins, and red/yellow yarn connections. |
| **Architectural Role** | Omnipresent floating forensic case tag on the virtual phone shell container, inheriting Phone OS floating button tokens. Accessible from any screen via the floating tag (`NotebookTab`, `#0B1017` with `#E11D48` left stripe and `IoScanOutline`) or the AssistiveTouch menu (`../app-design.md`). |

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

* **Canvas Material**: Deep darkroom chalkboard (`#0F151D`) with an overhead fluorescent lamp highlight bar and side lamp cone, framed by a dark vignette. The surface uses `chalkboard-map.svg` (`720x720` static SVG) featuring `feTurbulence` chalk-eraser dust wipes and tilted wife-detective chalk doodles (husband sketch marked `"PHẢN BỘI!"` / `"PHỤ BẠC"`, shopping bags, dining plates, messaging bubbles, magnifying glass, late-night clock).
* **Overhead Fluorescent Lamp Motion (`FluorescentLampHighlight` via `motion/react`)**:
  * **Startup Ignition & Ambient Flicker**: On notebook open, the overhead fluorescent tube runs a brief ignition flicker (`0.85s`) followed by a periodic ambient double-flicker (`0.55s` every `2.2s`).
  * **Synchronized Subtle Board Wash**: A `z-0` radial light wash (`h-[58%]`) behind the evidence cards dims and brightens in sync with the lamp tube, using a gentler `opacity` floor (`0.68` vs `0.38` on the tube) so card text stays legible and non-distracting.
  * **Performance & Accessibility**: Animates `opacity` only (`will-change-[opacity]`, never `box-shadow`) and falls back to static lighting when `useReducedMotion()` (`prefers-reduced-motion`) is active.
* **Physical Paper Cards**: Evidence cards on the board (`.corkboard-paper-card`, `#F5F1E8`, `#C9BFAE` border, `#0F172A` text) use a light crumpled, lightly stained aged-paper texture (subtle fold creases, soft tea-stain blotches, and paper fiber noise; no dot grid) so dark ink and yellow sticky notes maintain crisp contrast against the darkroom board. Each card's title is separated onto a borderless matte yellow sticky note tab (`.corkboard-sticky-note`, `#F6E271`, `-1.5deg` tilt, soft paper-lift shadow) overlapping the top-left corner; when the card has a contact avatar, it sits inside an attached square white-bordered film photo frame (`.corkboard-film-frame`, `#FBFAF7`, `-3deg` tilt, `ContactAvatar` `shape="square"`) alongside the sticky note with its source app badge. Cards are pinned with yellow masking tape (`#D4B44C`) and steel/crimson marker pins at top center. Inside `UnorganizedDrawer`, unplaced slips retain compact `#E6EBF0` / `#B8C4D0` list styling.
* **Confrontation Dossier**: Sealed darkroom casefile (`#141A22`) with a crimson left spine (`#E11D48`), cool-gray physical Polaroid frames (`#EEF2F6` / `#E6EBF0`), and cool-gray evidence ledger slips (`.dossier-paper-card`, `#EAEFF4`).

* **Typography (Universal `text-ios-*` Tokens)**:
  * Notebook Header: `text-ios-footnote` / `font-mono` uppercase (`#F1F5F9` on darkroom header `#090C10` - `#111722`).
  * Node Card / Suspect Title: `text-ios-callout` ($16\text{px}$ Semibold, `#0F172A`).
  * Node Snippet & Metadata: `text-ios-footnote` ($13\text{px}$ Regular, `#475569`, contrast $\ge 4.5:1$).
  * Confrontation CTA & Sixth Sense Trigger: `text-ios-headline` ($17\text{px}$ Semibold).
* **Ergonomics & Touch Targets**:
  * Omnipresent floating button $\ge 56 \times 56\text{px}$ with unplaced clue counter badge.
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

> **Layout**: Fullscreen overlay (`z-50`) featuring the darkroom header bar (`#090C10` - `#111722`) with `[Đóng]` and `[Định vị]` triggers, the 2D interactive red-string chalkboard (`CorkboardCanvas`), centered tactical bottom dock (`[Xếp gọn]`, `[Đối chất]`), and the slide-over unplaced clue drawer (`UnorganizedDrawer`).

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
  * **Contradiction (`contradicts_alibi` — Evidence vs. Alibi)**: Red dashed (`#DC2626`, `strokeDasharray: "5 3"`), representing the highest-level conflict link.
  * **Neutral (All other connections)**: Yellow solid (`#FBBF24`, solid line), representing standard/neutral links.
  * **Selected State**: Preserves the edge's type color while increasing stroke weight (`2.75`) and opacity (`1.0`).
* **"Giác Quan Thứ 6" (Sixth Sense) Hint States ([wireframe-sixth-sense.md](../../../../requirements/output/epic-02-investigation-suspicion-mechanics/wireframes/wireframe-sixth-sense.md))**:
  * **Ready**: `[Sparkles] Giác quan thứ 6` (`IoSparklesOutline`). Free on-demand hint.
  * **Uncollected Clue Exists**: Displays banner `[AppIcon] Xem [Tên ứng dụng]. [Về màn hình chính]`. Tapping `[Về màn hình chính]` returns to SpringBoard and highlights the target app icon (max 2 pulses then static ring) without opening the app or spoiling the exact clue inside.
  * **All Required Clues Collected (Unsolved Graph)**: Displays general reminder `[Book] Xem lại các mối liên hệ.` without revealing the correct card pair. Counts as a valid hint use and starts cooldown.
  * **30-Second Real-Time Cooldown**: Displays `[Time] 00:24` (`IoTimeOutline`, `tabular-nums`, persisted across notebook close/reopen and reloads). Under `prefers-reduced-motion`, shows static timer digits without spinning ring or per-second screen-reader chatter.
* **Source Deep-Link (`[Loc]` / `IoNavigateOutline`)**: Tapping `[Loc]` on any node or drawer card jumps directly to the source app and message/record while minimizing the notebook into a top floating banner (`[Pill: QuayLaiSoTay] Quay lại Sổ tay Điều tra`, `z-70`, `#E11D48`).

---

### 3.3. Pre-Confrontation Dossier (`ConfrontationConfirmModal`), Anytime Confrontation Hub & Shareable Roast Card (`ConfrontationModal` - US-016, US-017)

> **Preflight Dossier (`ConfrontationConfirmModal`, `z-75`)**: Before launching confrontation, tapping `[Đối chất]` opens a two-step Darkroom Casefile Dossier modal styled consistently with the Cold War board (`#141A22` darkroom folder, `#E11D48` left spine, `FILE 01` tab, cool-gray `#EEF2F6` Polaroids & `#EAEFF4` evidence slips, red stamps, monospace labels):
>   1. **Step 1 (Suspect Selection)**: Polaroid suspect cards on `.suspect-cork-tray` with 3D red pushpins and `"NGHI PHẠM"` / `"ĐÃ LỘT MẶT NẠ"` stamps.
>   2. **Step 2 (Confrontation Confirmation)**: Tilted Polaroid face-off (Husband vs Suspect) linked by a red string, 5-segment conviction strength indicator (`Tỉ lệ thành công`), **Deductive Linkage Bridges** (`verifiedStringsList` pairing connected clues via relationship bridge badges instead of raw text lists), and a red embossed dossier stamp CTA (`MÀY DÁM LỪA BÀ!`).
>
> **Confrontation Stage (`ConfrontationModal`, `z-80`)**: Fullscreen overlay evaluating the player's connected `CaseKnowledgeGraph` automatically upon confirmation (no manual dropdown or card-slotting required).

```
┌────────────────────────────────────────────────────────┐
│                 ĐỐI CHẤT CHỒNG HOÀNG                   │
│            [ Tiến độ chứng cứ cốt lõi: 3/3 ]           │
├────────────────────────────────────────────────────────┤
│                    [ Avatar Hoàng ]                    │
│                 (Cúi đầu, toát mồ hôi)                 │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Hoàng (thú nhận):                                │  │
│  │ "Anh xin lỗi vợ... Thôi anh khai thật! Bọn anh   │  │
│  │ có hẹn riêng tối nay ở quán cơm niêu..."         │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│                  KẾT QUẢ PHÁN QUYẾT                    │
│                       ★ ★ ★                            │
│              [Trophy] NỮ THÁM TỬ GHEN TUÔNG            │
│                                                        │
│  "Thợ điện gì mà hẹn lại đúng ngày, nhận váy kèm thiệp │
│   riêng, còn quẹt thẻ tận quán cơm!"                   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │       [ [Camera] TẠO THẺ ROAST KHOE MXH ]        │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │          [ [Unlock] THA THỨ & QUA MÀN ]          │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

* **Scaled Confrontation Tiers ([wireframe-us-016-confrontation-hub.md](../../../../requirements/output/epic-03-wife-notebook-verdict-social-sharing/wireframes/wireframe-us-016-confrontation-hub.md))**:
  * **M1 - Premature Accusation (0/3 Core Clues -> 0 Stars)**: Husband gaslights (*"chối bay chối biến"*). Normal levels increment Suspicion Meter by **+1 strike** (triggering Caught Snooping fail screen if max strikes reached) and offer `[Tiếp tục điều tra]`. In Level 0 practice mode, explains the missing step/evidence and allows safe retry with zero strike penalty.
  * **M2 - Partial Conviction (1/3 or 2/3 Core Clues -> 1-2 Stars)**: Husband stammers defensive excuses. Unlocks `[Tha thứ & Qua màn]` alongside `[Điều tra tiếp để đạt 3 sao]`.
  * **M3 - Full Conviction (3/3 Core Clues -> 3 Stars)**: Full confession, 3 stars, Wife Title badge, comedic roast punchline, `[Tạo thẻ Roast khoe MXH]` (`9:16` vertical Canvas/HTML card generator for TikTok/Zalo/Facebook), and `[Tha thứ & Qua màn]`.

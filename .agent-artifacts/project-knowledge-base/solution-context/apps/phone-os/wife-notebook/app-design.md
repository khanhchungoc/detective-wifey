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
> Sổ Tay Bắt Ghen Của Vợ inherits the global [Phone OS Master Design System](../app-design.md) for its physical container dimensions, `.glass-elevated` modal sheet backdrop blur, AssistiveTouch integration, and touch target standards ($\ge 44 \times 44\text{px}$). This document defines the domain-specific fuchsia detective journal visual overlay.

---

## 1. Brand Identity & Parody Theme

| Attribute | Specification |
|---|---|
| **Feature Name** | **Sổ Tay Bắt Ghen** (*Wife's Detective Notebook & Final Decision Hub*) |
| **Slogan / Tagline** | *"Lưới trời lồng lộng - Tay vợ khó thoát"* |
| **Real-World Parody** | Detective Case Dossier / Marital Journal |
| **Visual Persona** | Playful, dramatic, and empowering. Styled like a spiral-bound pink/fuchsia detective notebook with sticker stamps, highlighter notes, and paper clip accents. |
| **Architectural Role** | Omnipresent floating tool on the virtual phone shell container, inheriting Phone OS floating button tokens. Accessible from any screen via a floating action button (FAB) or the AssistiveTouch menu (`../app-design.md`). |

---

## 2. Visual Design System & Color Tokens

```
┌────────────────────────────────────────────────────────┐
│               WIFE'S NOTEBOOK COLOR PALETTE            │
├────────────────────────────────────────────────────────┤
│ Cover / Primary:      Fuchsia Rose    #D81B60          │
│ Board Canvas:         Muted Cardboard #E8D8AA          │
│ Paper / Drawer:       Cream Paper     #FFF9E8          │
│ Surface Border:       Cardboard Tan   #D4B977          │
│ Sticky Note Accent:   Canary Yellow   #FFF59D          │
│ Accent Stamp:         Crimson Stamp   #C2185B          │
│ Verdict Confirm CTA:  Electric Purple #8E24AA          │
│ Innocent Green Badge: Emerald Leaf    #2E7D32          │
│ Cheating Red Badge:   Danger Red      #D32F2F          │
│ Sugar Purple Badge:   Grape Violet    #7B1FA2          │
└────────────────────────────────────────────────────────┘
```

* **Canvas Material**: Muted yellow-beige cardboard with subtle, static grain and short paper fibers. Faint brown pinprick dots sit 30px apart, with slight variation in radius and opacity. Keep the texture behind evidence cards; use light paper surfaces and dark text for drawers, controls, and overlays. Retain fuchsia accents and the existing board interactions.

* **Typography (Universal `text-ios-*` Tokens)**:
  * Notebook Header: `text-ios-title-3` ($20\text{px}$ Semibold, `#FFFFFF` on Fuchsia header).
  * Node Card / Suspect Title: `text-ios-callout` ($16\text{px}$ Semibold, `#0F172A`).
  * Node Snippet & Metadata: `text-ios-footnote` ($13\text{px}$ Regular, `#475569`, contrast $\ge 4.5:1$).
  * Confrontation CTA & Sixth Sense Trigger: `text-ios-headline` ($17\text{px}$ Semibold).
* **Ergonomics & Touch Targets**:
  * Omnipresent floating button $\ge 56 \times 56\text{px}$ with unplaced clue counter badge.
  * All header buttons (`[Đóng]`, `[Giác quan thứ 6]`, `[Đối chất]`) and node `[Loc]` deep-link buttons enforce $\ge 44 \times 44\text{px}$ touch targets (`.touch-target-min`).

---

## 3. UI Wireframes & Layout Architecture

### 3.1. Contextual Long-Press Pinning Modal (`UniversalEvidenceModal` - US-011)

> **Trigger**: Long-press ($\ge 380\text{ms}$) or keyboard `Enter`/`Space` on any interactive story narrative element (`StoryEvidenceTarget`) in any parody app.  
> **Backdrop**: Translucent dimming overlay with `.glass-elevated` modal card (`role="dialog"`, `aria-modal="true"` with focus trap). Zero spoilers or static pin buttons on parent screen.

```
┌────────────────────────────────────────────────────────┐
│                        ══════                          │
│                   THÊM VÀO SỔ TAY                      │
├────────────────────────────────────────────────────────┤
│ Đoạn thông tin đã chọn:                                │
│ "Thu Trang | Chung cư mini số 12 ngõ 85 Chùa Láng"     │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ [ [Pin] Ghim vào Sổ tay                          ] │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ [ [Close] Đóng                                       ] │
└────────────────────────────────────────────────────────┘
```

---

### 3.2. Detective Corkboard Node Canvas & "Giác Quan Thứ 6" Hint Header (`WifeNotebookModal` - US-015, US-022, US-033)

> **Layout**: Fullscreen overlay (`z-50`) featuring the Fuchsia Rose header bar with `[Giác quan thứ 6]` (`IoSparklesOutline`) and `[Đối chất]` triggers, the 2D interactive red-string corkboard (`BangNoiDay`), the active smoking-gun objective counter (*Bằng chứng cốt lõi: X/3*), and the bottom unplaced clue drawer (`Khay Manh Mối Thu Thập`).

```
┌────────────────────────────────────────────────────────┐
│ [Close] Đóng            SỔ TAY             [MiniMap]   │
│ [Sparkles] Giác quan thứ 6 (00:30)     [Đối chất]      │
├────────────────────────────────────────────────────────┤
│ [AppIcon] Xem [Tên ứng dụng].    [ [Home] Về màn chính]│
├────────────────────────────────────────────────────────┤
│   ┌────────────────────┐        ┌────────────────────┐ │
│   │ [Mask] VỎ BỌC [Loc]│        │ [Phone] SĐT  [Loc] │ │
│   │ "Anh Tuấn Thợ Điện"│══(Đỏ)══╡ 0988886677         │ │
│   │ [Zola] 23:44       │        │ [Phone] [Shopoo]   │ │
│   └────────────────────┘        └─────────┬──────────┘ │
│                                           │ (Dây Đỏ)   │
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

* **"Giác Quan Thứ 6" (Sixth Sense) Hint States ([wireframe-sixth-sense.md](../../../../requirements/output/epic-02-investigation-suspicion-mechanics/wireframes/wireframe-sixth-sense.md))**:
  * **Ready**: `[Sparkles] Giác quan thứ 6` (`IoSparklesOutline`). Free on-demand hint.
  * **Uncollected Clue Exists**: Displays banner `[AppIcon] Xem [Tên ứng dụng]. [Về màn hình chính]`. Tapping `[Về màn hình chính]` returns to SpringBoard and highlights the target app icon (max 2 pulses then static ring) without opening the app or spoiling the exact clue inside.
  * **All Required Clues Collected (Unsolved Graph)**: Displays general reminder `[Book] Xem lại các mối liên hệ.` without revealing the correct card pair. Counts as a valid hint use and starts cooldown.
  * **30-Second Real-Time Cooldown**: Displays `[Time] 00:24` (`IoTimeOutline`, `tabular-nums`, persisted across notebook close/reopen and reloads). Under `prefers-reduced-motion`, shows static timer digits without spinning ring or per-second screen-reader chatter.
* **Source Deep-Link (`[Loc]` / `IoNavigateOutline`)**: Tapping `[Loc]` on any node or drawer card jumps directly to the source app and message/record while minimizing the notebook into a top floating banner (`[Pill: QuayLaiSoTay] Quay lại Sổ tay Điều tra`, `z-70`, `#D81B60`).

---

### 3.3. Anytime Confrontation Hub, Dynamic Excuse Engine & Shareable Roast Card (`ConfrontationModal` - US-016, US-017)

> **Layout**: Fullscreen overlay (`z-80`) evaluating the player's connected `CaseKnowledgeGraph` automatically upon tapping `[Đối chất]` at any time (no manual dropdown or card-slotting required).

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

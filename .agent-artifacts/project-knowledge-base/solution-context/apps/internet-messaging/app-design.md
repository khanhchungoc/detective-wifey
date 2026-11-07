---
type: App Design Specification
app_id: zola
app_name: Zola
real_world_parody: Zalo
status: approved
description: "Authoritative branding, UI/UX visual design system, color tokens, typography, component inventory, and screen layout specifications for the Zola private messaging app, strictly conforming to the reference Zalo layout, palette, and typography."
tags: [app-design, zola, zalo, ui-ux, design-system, branding, wireframe, color-tokens, typography]
timestamp: "2026-10-14T11:25:00+07:00"
---

# Zola - App Design & UI/UX Specification

---

## 1. Brand Identity & Reference Architecture

| Attribute | Specification |
|---|---|
| **App Name** | **Zola** (Satirical real-world parody of *Zalo*) |
| **Real-World Parody** | Zalo Mobile Platform (VNG Corporation) - Vietnam's leading chat and social communication application. |
| **Design Mandate** | **Satirical Parody Fidelity**: Evokes domestic Vietnamese messaging UX (electric blue header, priority/other inbox tabs, group sender colors, and floating reaction capsules) while introducing satirical naming (*Zola*, *ZolaPay*, *zCloud*) and distinct parody iconography (`IoChatbubbleEllipsesOutline`) to comply with brand safety requirements ([vision-scope.md §4](../../../requirements/output/vision-scope.md#4-key-constraints--non-functional-requirements-global)). |
| **Integrated Sub-Brand** | **ZolaPay** (In-chat peer-to-peer micro-transfers and lucky money / lì xì cards, parodying *ZaloPay*). |
| **Slogan / Tagline** | *"Kết nối tình thân - Bí mật khó giấu"* |
| **Visual Persona** | **The Deceptive Domestic Hub**: Familiar, ubiquitous, and seemingly harmless personal messaging app harboring hidden chats, disguised extramarital contacts, intimate audio memos, and suspicious micro-transfers. |

---

## 2. Visual Design System & Color Tokens

The color palette directly adopts the exact native color values from the authoritative Zalo design standard:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          ZOLA COLOR PALETTE                            │
├────────────────────────────────────────────────────────────────────────┤
│ Primary Brand / Header Blue:    Electric Blue      #0088FF             │
│ Top Status Bar Surface:         Header Gradient    #0088FF             │
│ Active Tab & Highlight:         Vibrant Blue       #0088FF             │
│ Inactive Tab / Neutral Icon:    Slate Gray         #595C60             │
│                                                                        │
│ Canvas Background (Lists):      Pure White         #FFFFFF             │
│ Canvas Background (Chat Feed):  Cool Gray-Blue     #E5EBF0             │
│ Section Separator / Inset Bar:  Soft Gray          #F0F2F5             │
│ Border & Thin Dividers:         Hairline Gray      #E2E8F0             │
│                                                                        │
│ Incoming Message Bubble:        Pure White         #FFFFFF             │
│ Outgoing Message Bubble:        Pale Sky Blue      #D2F4FF             │
│ Message Bubble Shadow:          Ambient Shadow     rgba(0, 0, 0, 0.06) │
│                                                                        │
│ Text Primary (Headers & Body):  Deep Charcoal      #0F172A / #000000   │
│ Text Secondary & Muted Snippet: Cool Slate         #475569 / #52525B   │
│ Text Timestamp & Subtitles:     Accessible Slate   #64748B (≥4.5:1 AA) │
│ Top Bar Text & Icons:           Pure White         #FFFFFF             │
│                                                                        │
│ Floating Timestamp Pill Bg:     Dark Frosted Slate rgba(15,23,42,0.68) │
│ Floating Timestamp Text:        Pure White         #FFFFFF (≥4.5:1 AA) │
│ Floating Reaction Pill Bg:      Pure White         #FFFFFF             │
│ Floating Reaction Pill Border:  Subtle Gray        #E2E8F0             │
│                                                                        │
│ Unread Badge / Alert Red:       Vivid Red          #FF3B30             │
│ Muted Notification Badge:       Accessible Slate   #64748B             │
│ Active Filter Pill Fill:        Light Gray         #E4E6EB             │
│ Active Filter Pill Text:        Near Black         #050505             │
│ Inactive Filter Pill Text/Border:Muted Slate       #6B7280 / #D1D5DB   │
├────────────────────────────────────────────────────────────────────────┤
│                  GROUP CHAT SENDER PALETTE (ZOLA)                      │
├────────────────────────────────────────────────────────────────────────┤
│ Participant Color 1 (e.g. Tuấn Nam): Amber / Brown  #B45309             │
│ Participant Color 2 (e.g. Chị Mai):  Teal / Emerald #007A5A             │
│ Participant Color 3 (e.g. Linh Đỗ):  Royal Blue     #2563EB             │
│ Participant Color 4 (e.g. Thảo Ngân):Violet/Purple  #7C3AED             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Typography System

Zola inherits the universal Apple HIG `text-ios-*` dynamic scale ([design.md §3.1.1](../../design-system/design.md#311-universal-shared-typography-scale-vs-scoped-app-font-color-invariant)) paired with Zola brand and semantic colors:

| Level / UI Element | Canonical Token (`text-ios-*`) | Weight | Color | Line Height / Notes |
|---|---|---|---|---|
| **Status Bar Clock & Indicators** | `text-ios-subheadline` ($15\text{px}$) | Semibold ($600$) | `#FFFFFF` | Governed by OS `StatusBar` (`tabular-nums`) |
| **Top App Header Title** | `text-ios-callout` ($16\text{px}$) | Semibold ($600$) | `#FFFFFF` | Group or contact name |
| **Top App Header Subtitle** | `text-ios-caption-1` ($12\text{px}$) | Medium ($500$) | `#FFFFFF` (85% op) | *"Bấm để xem thông tin"* |
| **Header Search Placeholder** | `text-ios-subheadline` ($15\text{px}$) | Regular ($400$) | `#FFFFFF` (85% op) | *"Tìm kiếm"* |
| **Sub-Header Tabs (Ưu tiên / Khác)** | `text-ios-subheadline` ($15\text{px}$) | Semibold / Regular | `#000000` / `#52525B` | Active has $2\text{px}$ bottom underline |
| **Filter Pills (Tất cả / Bạn bè / OA)** | `text-ios-footnote` ($13\text{px}$) | Medium ($500$) | `#050505` / `#475569` | Capsule inside $\ge 44\text{px}$ `.touch-target-min` |
| **Contact / Chat Title** | `text-ios-subheadline` ($15\text{px}$) | Semibold ($600$) | `#000000` | Semibold for unread conversations |
| **Chat Snippet / Preview** | `text-ios-footnote` ($13\text{px}$) | Regular ($400$) | `#475569` / `#0F172A` | Sender prefix + truncated message |
| **List Timestamp / Pin Note** | `text-ios-caption-1` ($12\text{px}$) | Medium ($500$) | `#64748B` | Right-aligned time/date (`tabular-nums`) |
| **Message Bubble Text** | `text-ios-subheadline` ($15\text{px}$) | Regular ($400$) | `#0F172A` | Comfortable mobile chat legibility |
| **Message Bubble Sender Name** | `text-ios-caption-1` ($12\text{px}$) | Semibold ($600$) | Color-coded per actor | Left-aligned inside incoming bubble |
| **Message Bubble Timestamp** | `text-ios-caption-2` ($11\text{px}$) | Semibold ($600$) | `#64748B` | Bottom corner inside bubble |
| **Floating Time Capsule** | `text-ios-caption-2` ($11\text{px}$) | Semibold ($600$) | `#FFFFFF` on `rgba(15,23,42,0.68)` | Pill padding: $3\text{px} \times 10\text{px}$ ($\ge 4.5:1$) |
| **Reaction Badge Count** | `text-ios-caption-2` ($11\text{px}$) | Semibold ($600$) | `#475569` | Overlapping bottom edge of bubble |
| **Bottom Navigation Labels** | `text-ios-caption-2` ($11\text{px}$) | Semibold ($600$) | Active `#0088FF` / `#52525B` | Under 5 primary bottom icons |
| **Profile Display Name** | `text-ios-headline` ($17\text{px}$) | Semibold ($600$) | `#0F172A` | Accompanied by gray chevron `>` |
| **Profile Status Button** | `text-ios-caption-1` ($12\text{px}$) | Medium ($500$) | `#475569` | Rounded pill with border ($\ge 44\text{px}$ hit area) |
| **Profile Menu Title** | `text-ios-subheadline` ($15\text{px}$) | Medium ($500$) | `#0F172A` | e.g. *zBusiness*, *zCloud*, *Ví QR* |
| **Profile Menu Subtitle** | `text-ios-footnote` ($13\text{px}$) | Regular ($400$) | `#64748B` | Single-line feature explanation |
| **Contact Section Index ("A")** | `text-ios-caption-1` ($12\text{px}$) | Semibold ($600$) | `#64748B` | Uppercase sticky index label |

---

## 4. Screen Layouts & Component Specifications

### 4.1. Global Chrome & Navigation
* **Top Header Bar**: Height $56\text{px}$, background `#0088FF`. Holds back navigation or search input, QR scanner, add buttons, and contextual menus.
* **Bottom Navigation Bar (5-Tab System)**:
  * Height $56\text{px}$, background `#FFFFFF`, top border `1px solid #E5E7EB`.
  * **Tab 1: Tin nhắn** (Active icon: Blue chat bubble with horizontal lines, badge pill counter e.g. `[4]`).
  * **Tab 2: Danh bạ** (Active icon: Blue address book card / contact silhouette).
  * **Tab 3: Khám phá** (4 square grid layout, red alert dot `[●]`).
  * **Tab 4: Nhật ký** (Timeline / feed card icon with red notification pill `[N]`).
  * **Tab 5: Cá nhân** (User profile silhouette with red exclamation badge `[!]`).
* **Ergonomics**: All touch targets $\ge 44 \times 44\text{px}$; search inputs $\ge 48\text{px}$ height; list item rows $72\text{px}$ height.
* **Conversation Avatars**: Chat, contact, and thread-header avatars use identity-specific profile choices such as casual selfies, anime art, pets, children's photos, family photos, full-body shots, and landscapes. Keep each known identity consistent across apps. Use group or service imagery for group and business accounts, and preserve disguised identities without revealing the hidden person.

### 4.2. Chat Thread Engine (`ZolaChatThreadView`)
* **Canvas**: Subtle gray-blue canvas (`#E5EBF0`) providing optimal contrast against incoming white bubbles.
* **Mascot Sticker Integration**: Centered sticker display (Ami Fat Cat parody mascot).
* **Floating Date/Time Pills**: Centered pill capsule with background `#B4B9BF`, padding $3\text{px} \times 10\text{px}$, white $11\text{px}$ text.
* **Incoming Message Bubbles**:
  * Pure white background (`#FFFFFF`), border radius $14\text{px}$ (top-left $4\text{px}$).
  * Sender name colored distinctively per participant ($12\text{px}$ bold).
  * Message body ($14\text{px}$ regular, `#0F172A`).
  * Timestamp at bottom ($11\text{px}$ gray).
* **Floating Reaction Badges**:
  * Attached directly to the bottom right of the bubble container.
  * White capsule pill (`#FFFFFF`), border `1px solid #E2E8F0`, shadow `0 1px 3px rgba(0,0,0,0.1)`.
  * Displays reaction icon + counter (e.g. 👍 `1`, 😆 `1`, 😮 `2`, ❤️ `5`) alongside quick-heart icon `♡`.
* **Bottom Input Bar**:
  * Height $52\text{px}$, white background (`#FFFFFF`), border-top `1px solid #E2E8F0`.
  * Left: Sticker/Emoji selector icon `(^_^)`.
  * Center: Flat input text container with placeholder *"Tin nhắn"*.
  * Right: Overflow actions `•••`, voice recording microphone icon 🎙️, and photo gallery icon 🖼️.

### 4.3. Address Book & Contacts Engine (`ZolaContactsView`)
* **Search & Header**: Blue header with search input, add group icon, and add contact icon.
* **Filter Pills**: Row of 3 capsule buttons:
  * *"Tất cả"* (Selected: light gray background `#E4E6EB`, dark text).
  * *"Bạn bè"* (Inactive: white with slate border/text).
  * *"OA"* (Official Accounts: inactive).
* **Alphabetical Contact Directory**:
  * Uppercase letter section dividers (e.g. *"A"*).
  * Clean contact rows with circular avatars, full contact names, and direct call action shortcuts.

### 4.4. Profile & Ecosystem Hub (`ZolaProfileView`)
* **Header Bar**: Blue header with Search bar and Settings gear icon ⚙️ with red `[!]` badge.
* **Profile Header Card**:
  * White background, centered layout.
  * Status button: Small pill button *"😊 Trạng thái..."*.
  * Large circular profile picture ($72\text{px}$–$80\text{px}$ diameter).
  * User display name: *"Hoàng Minh >"* ($17\text{px}$ bold).
* **Grouped Feature Rows** (White cards separated by $8\text{px}$ `#F0F2F5` dividing bars):
  * **Section 1 (Ecosystem)**: *zBusiness*, *zCloud*, *zStyle*.
  * **Section 2 (Storage & Utilities)**: *My Documents*, *Dữ liệu trên máy*, *Ví QR*.
  * **Section 3 (Security & Privacy)**: *Tài khoản và bảo mật*, *Quyền riêng tư*.

---

## 5. UI Layout Wireframes (ASCII Architecture)

> Full structured ASCII wireframe layouts conforming strictly to the Zero-Emoji Invariant are maintained in the canonical knowledge base companion:  
> **[`wireframe.md`](./wireframe.md)**.

### 5.1. Summary Overview of the 4 Core Screens

```
┌────────────────────────────────────────────────────────┐
│ SCREEN 1: CHAT THREAD        SCREEN 2: CONTACTS (DANH BẠ)
│ ┌────────────────────────┐   ┌────────────────────────┐
│ │[<] Alpha Team BA [🔍]  │   │[🔍] Tìm kiếm    [+Group]│
│ ├────────────────────────┤   ├────────────────────────┤
│ │   [ Sticker Cat ]      │   │ (Tất cả) (Bạn bè) (OA) │
│ │     [ 10:56 ]          │   │ A                      │
│ │[Avatar] Tuấn Nam:      │   │ [Avt] Anh Bách [Tel][Cam│
│ │ Khách hàng chê bản demo│   │ [Avt] Anh Bình [Tel][Cam│
│ │            [Like 1][♡] │   │ B                      │
│ │[Avatar] Chị Mai QLDA:  │   │ [Avt] Bác Bảo Vệ [Tel][Cam│
│ │ Thế chắc phải cày OT   │   ├────────────────────────┤
│ ├────────────────────────┤   │[Msg][Contacts][Grid][Me│
│ │[Smile][ Tin nhắn ][Mic]│   └────────────────────────┘
│ └────────────────────────┘                            
├────────────────────────────────────────────────────────┤
│ SCREEN 3: PROFILE (CÁ NHÂN)  SCREEN 4: INBOX (TIN NHẮN)
│ ┌────────────────────────┐   ┌────────────────────────┐
│ │[🔍] Tìm kiếm    [Gear!]│   │[🔍] Tìm kiếm   [QR] [+]│
│ ├────────────────────────┤   ├────────────────────────┤
│ │    (Trạng thái...)     │   │ [Ưu tiên]       [Khác●]│
│ │       [Avatar]         │   │ 📌 Bé Thỏ Con  2p [📌] │
│ │     Hoàng Minh >       │   │    Bạn: Tối mai chỗ cũ │
│ │ 💼 zBusiness         > │   │ 📌 Alpha Team  3p [ 1 ]│
│ │ ☁️ zCloud            > │   │    Linh Đỗ: Sếp duyệt..│
│ │ ---------------------- │   │ 👥 Tiệm Hoa    7p [ 5+]│
│ │ 📁 My Documents      > │   │    [Hình ảnh]      [🔕]│
│ │ ⏱️ Dữ liệu trên máy  > │   │ 👤 Chị Lan    12h      │
│ ├────────────────────────┤   ├────────────────────────┤
│ │[Msg][Contacts][Grid][Me│   │[Msg 4][Contacts][Grid] │
│ └────────────────────────┘   └────────────────────────┘
└────────────────────────────────────────────────────────┘
```

---

## 6. Forensic Clue Mechanics & Parody Integrations

1. **Disguised Contact Clue (`CLUE-ZOLA-01`)**:
   - Suspects saved under deceptive professional titles (e.g. *"Anh Tuấn Thợ Điện"*, *"A Bách, PM TCB"*).
   - In-chat evidence shows pet names (*"bé cưng"*, *"anh iu"*) and romantic heart reactions.
2. **Hidden PIN-Protected Chat (`CLUE-ZOLA-02`)**:
   - Secret chat hidden from main list; accessed via searching PIN in search bar or tapping locked thread.
   - Requires 4-digit PIN found in husband's personal notes (`apps/personal-notes/`).
3. **Disappearing Messages Banner (`CLUE-ZOLA-03`)**:
   - In-chat notification bar: *"⚠️ Tin nhắn tự xoá sau 24h đã được kích hoạt"*.
4. **ZolaPay In-Chat Transfer Bubble (`CLUE-ZOLAPAY-01`)**:
   - Peer-to-peer transfer card inside chat thread showing transfers (e.g. `+ 5.200.000 đ` with message *"Tặng bé cưng đi spa cuối tuần 💕"*).
5. **Universal Clue Pinning (`380ms` Long-Press)**:
   - Any message bubble, ZolaPay transfer card, or contact row is wrapped in `StoryEvidenceTarget` (`380ms` long-press or `Enter`/`Space` on keyboard focus) to open `UniversalEvidenceModal` with zero static pin buttons.

---

## 7. Authoritative Documents & Companion Artifacts

* **Canonical ASCII Wireframe**: [`wireframe.md`](./wireframe.md)
* **Functional Features & Clue Matrix**: [`features.md`](./features.md)
* **Master App Architecture**: [`../../architecture/apps-features-architecture.md`](../../architecture/apps-features-architecture.md)
* **Reference Source**: Native Zalo mobile application design & UI hierarchy (verified from October 2026 reference captures).

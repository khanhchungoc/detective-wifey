# Zola - Group Chat Conversation Thread ASCII Wireframe Specification

**App ID**: `zola`  
**App Name**: Zola (Parody of Zalo)  
**Parent Epic**: [`epic-01-virtual-phone-app-ecosystem`](../epic.md)  
**Related User Story**: [`us-030-zola-group-chat-multi-participant-messaging.md`](../us-030-zola-group-chat-multi-participant-messaging.md)  
**Parent Specification**: [internet-messaging/app-design.md](../../../project-knowledge-base/solution-context/apps/internet-messaging/app-design.md)  
**Functional Features**: [internet-messaging/features.md](../../../project-knowledge-base/solution-context/apps/internet-messaging/features.md)  
**Viewport Target**: Mobile Portrait Viewport (393px × 852px base)  
**Design Standard**: Strict Zalo Mobile Group Chat Layout, Typography Hierarchy, and Color System  
**Zero-Emoji Invariant**: Adheres strictly to bracketed semantic tokens (`[Search]`, `[Back]`, `[+User]`, `[Menu]`, `[Avt: ...]`, `[Pin]`, `[Heart]`, etc.)  
**User Decision Delta**: Dual-purpose role (benign workplace/family banter + clue-bearing threads); full evidence and suspect pinning enabled (message long-press pins clue, contact name long-press pins suspect); individual participant avatars omitted in conversation thread to display contact name only; Group Info / Member List settings screen deferred to future enhancement.

---

## 1. Physical Device Chrome & In-App Group Header

```
┌────────────────────────────────────────────────────────────────────────┐
│ 9:28 [App: Zola]                           [Signal: 5G] [||||] [Batt: 69%] │
└────────────────────────────────────────────────────────────────────────┘
```
- **Clock**: Left-aligned `9:28`, font size 14px Semibold.
- **Top Bar Surface**: Electric Blue (`#0088FF`).
- **Status Indicators**: Right-aligned cellular protocol `5G`, 4 signal bars `[||||]`, and battery glyph `[Batt: 69%]`.

---

## 2. Screen: Group Chat Conversation Thread (`ZolaGroupChatThreadView`)

> **Entry Route**: Tapping group chat row (e.g. *"Alpha Team BA & Dev"*, *"Gia Đình Ngoại"*, or *"Hội Bỉm Sữa Cầu Giấy"*) from Zola Inbox (`ZolaInboxView`).  
> **Key Capabilities**: Back navigation to inbox, multi-avatar group title in header, member count subtitle, Ami Fat Cat sticker mascot, floating timestamp capsules, multi-colored participant contact names (avatars omitted from chat feed), message bubbles with reactions, and dual long-press targets (message -> clue, contact name -> suspect).

```
┌────────────────────────────────────────────────────────────────────────┐
│ 9:28 [App: Zola]                           [Signal: 5G] [||||] [Batt: 69%] │
├────────────────────────────────────────────────────────────────────────┤
│ [Back]  [Avt: Group] Alpha Team BA & Dev           [+User] [Search] [Menu]│
│                      Bấm để xem thông tin (8 thành viên)               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                      ┌──────────────────────┐                          │
│                      │   [ Sticker Cat:     │                          │
│                      │    Ami Mập Sleeping ]│                          │
│                      └──────────────────────┘                          │
│                                                                        │
│                              [ 10:56 ]                                 │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────┐         │
│ │ Tuấn Nam (#B45309 Amber)                                   │         │
│ │ Khách hàng chê bản demo UI đợt này quá nhiều lỗi           │         │
│ └────────────────────────────────────────────────────────────┘         │
│                                        ┌────────────┐                  │
│                                        │ [Like: 1]  │ [Heart-Outline]  │
│                                        └────────────┘                  │
│ ┌────────────────────────────┐                                         │
│ │ căng ghê                   │                                         │
│ │ 11:00                      │                                         │
│ └────────────────────────────┘                                         │
│                                                                        │
│                        [ 13:14 13/10/2026 ]                            │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────┐         │
│ │ Chị Mai QLDA (#007A5A Green)                               │         │
│ │ Thế chắc đợt này phải cày OT bù tiến độ rồi                │         │
│ │ 13:14                                                      │         │
│ └────────────────────────────────────────────────────────────┘         │
│                                        ┌────────────┐                  │
│                                        │ [Laugh: 1] │ [Heart-Outline]  │
│                                        └────────────┘                  │
│                                                                        │
│                        [ 22:10 13/10/2026 ]                            │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────┐         │
│ │ Lan Hương (#D97706 Orange)                                 │         │
│ │ Tối nay sếp Thịnh nói bận việc riêng không đi ăn cùng      │         │
│ │ team được nè [Wink]                                        │         │
│ │ 22:10                                                      │         │
│ └────────────────────────────────────────────────────────────┘         │
│                                        ┌────────────┐                  │
│                                        │ [Surp: 2]  │ [Heart-Outline]  │
│                                        └────────────┘                  │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────┐         │
│ │ Lan Hương (#D97706 Orange)                                 │         │
│ │ Mai nhớ mang quà chuộc lỗi nhé                             │         │
│ │ 22:12                                                      │         │
│ └────────────────────────────────────────────────────────────┘         │
│                                                                        │
│                               ┌──────────────────────────────┐         │
│                               │ Anh đang bận họp với đối tác │ 22:15   │
│                               │ mai bàn tiếp nhé mọi người   │ [Read]  │
│                               └──────────────────────────────┘         │
├────────────────────────────────────────────────────────────────────────┤
│ [Sticker]  Nhập tin nhắn...                      [Voice] [Photo] [Send]│
├────────────────────────────────────────────────────────────────────────┤
│                        ═══════ [ - ] ═══════                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Details & Layout Specifications

### 3.1. Group Chat Header (56px Height)
- **Surface**: Electric Blue (`#0088FF`).
- **Left Action**: `[Back]` navigation caret (24px, `#FFFFFF`), tap returns to `ZolaInboxView`.
- **Title Block**:
  - Row 1: `[Avt: Group]` 36px composite circle + Group Name (e.g. *"Alpha Team BA & Dev"*), 16px Bold (`#FFFFFF`), truncated with ellipsis if exceeding container width.
  - Row 2: Subtitle *"Bấm để xem thông tin (8 thành viên)"*, 12px Regular (`#FFFFFF` at 85% opacity). *Note: Group info drawer is deferred; tapping triggers standard placeholder toast.*
- **Right Action Cluster**:
  - `[+User]`: Add participant icon (22px, `#FFFFFF`).
  - `[Search]`: In-chat search icon (22px, `#FFFFFF`).
  - `[Menu]`: Group hamburger menu icon (22px, `#FFFFFF`).

### 3.2. Conversation Canvas & Multi-Participant Feed
- **Canvas Background**: Soft gray-blue (`#E5EBF0`) providing clear contrast against white text bubbles.
- **Floating Date & Time Pills**: Centered capsule badge, background `#B4B9BF`, padding 3px × 10px, border-radius 10px, white 11px text (`[ 10:56 ]`, `[ 13:14 13/10/2026 ]`).
- **Mascot Sticker Integration**: Parody animated cat sticker (*Ami Mập Sleeping* or *Ami Mập Eating*), centered in timeline.
- **Participant Color System**:
  - Senders receive consistent assigned palette tokens for display names:
    - Participant 1 (Tuấn Nam): Amber (`#B45309`)
    - Participant 2 (Chị Mai QLDA): Emerald Green (`#007A5A`)
    - Participant 3 (Lan Hương): Vivid Orange / Coral (`#D97706`)
    - Participant 4 (Other Colleagues): Violet (`#7C3AED`)
- **Incoming Message Bubbles**:
  - Left-aligned; white background (`#FFFFFF`), border-radius 14px (top-left 4px).
  - Avatar-Free Layout: Individual participant avatars are omitted in the conversation feed; contact name renders cleanly at the top of the bubble.
  - First line: Participant contact name in their assigned color token (12px Bold).
  - Body text: 14px regular (`#0F172A`).
  - Bottom metadata: Timestamp (11px gray `#8A9098`) + reaction badge pill.
- **Outgoing Message Bubbles (Husband Thịnh)**:
  - Right-aligned; light blue background (`#D2F4FF`), border-radius 14px (top-right 4px).
  - Body text: 14px regular (`#0F172A`).
  - Metadata: Timestamp + delivery receipt (`[Read]`).
- **Reaction Badge Capsule**:
  - Attached to bottom-right of message bubble: white capsule `#FFFFFF`, 1px solid `#E2E8F0`, shadow `0 1px 2px rgba(0,0,0,0.08)`.
  - Content: Reaction glyph + count (e.g. `[Like: 1]`, `[Laugh: 1]`, `[Surp: 2]`) alongside quick heart icon `[Heart-Outline]`.

### 3.3. Bottom Action Bar (52px Height)
- **Surface**: Pure white (`#FFFFFF`), border-top `1px solid #E2E8F0`.
- **Left**: `[Sticker]` mascot face icon (24px).
- **Center**: Text input mock container with placeholder *"Nhập tin nhắn..."* (40px height, background `#F0F2F5`, border-radius 20px).
- **Right Cluster**: `[Voice]` microphone icon (24px), `[Photo]` media gallery icon (24px), `[Send]` paper airplane send icon (24px).

---

## 4. Key Interactions & Forensic Clue Touchpoints

### 4.1. Universal Clue Pinning (Message Bubbles)
- **Gesture**: Long-press ($\ge 450\text{ms}$) on any incoming or outgoing message bubble.
- **Feedback**: Light haptic vibration (`15ms`) + subtle bubble scale pulse (`scale(0.98)`).
- **Sheet**: Summons `UniversalEvidenceModal` displaying:
  - Message text snippet preview.
  - Sender identity and group context (*"Tin nhắn từ Lan Hương trong nhóm Alpha Team"*).
  - Action button: *"Ghim vào Sổ Tay Bắt Ghen"* (`Pin Evidence`).
- **Zero-Spoiler Guarantee**: All message bubbles support the long-press gesture identically, preventing visual giveaways about which messages contain critical clues.

### 4.2. Universal Suspect Pinning (Participant Contact Name Banner)
- **Gesture**: Long-press ($\ge 450\text{ms}$) on any participant's contact name banner at the top of an incoming message bubble.
- **Feedback**: Light haptic vibration (`15ms`) + contact name text highlight glow (`#0088FF`).
- **Sheet**: Summons `UniversalEvidenceModal` in Suspect mode:
  - Display name (e.g. *"Lan Hương"*).
  - Inferred role/context (*"Thành viên nhóm Alpha Team BA & Dev"*).
  - Action button: *"Thêm vào danh sách Nghi Phạm"* (`Pin Suspect`).
- **Investigation Value**: Enables player to identify and flag potential affair suspects directly from workplace or social groups.

### 4.3. Navigation & State Behaviors
- **Back Button**: Tapping `[Back]` transitions smoothly back to `ZolaInboxView` without resetting scroll position.
- **Read-Only Invariant**: Tapping input bar, send button, or voice recorder triggers subtle visual pulse or non-blocking tooltip (*"Chỉ có thể quan sát tin nhắn khi đang điều tra"*), preventing accidental typing.
- **Info Subtitle Tap**: Tapping group header displays brief toast (*"Tính năng xem danh sách thành viên sẽ ra mắt ở bản cập nhật tiếp theo"*).


# Zola - Canonical ASCII Wireframe Specification

**App ID**: `zola`  
**App Name**: Zola (Parody of Zalo)  
**Parent Specification**: [`app-design.md`](./app-design.md)  
**Functional Features**: [`features.md`](./features.md)  
**Viewport Target**: Mobile Portrait Viewport ($393\text{px} \times 852\text{px}$)  
**Design Standard**: Strict Zalo Mobile App Layout, Typography, and Color System  
**Zero-Emoji Invariant**: Adheres strictly to bracketed semantic tokens (`[Search]`, `[QR]`, `[+]`, `[Back]`, `[Phone]`, `[Video]`, etc.)  
**Data Privacy**: All personal names, corporate identifiers, and chat feeds are strictly anonymized and fictionalized for game world lore.

---

## 1. Physical Device Chrome & Status Bar

```
┌────────────────────────────────────────────────────────────────────────┐
│ 9:28 [App: Zola]                           [Signal: 5G] [||||] [Batt: 69%] │
└────────────────────────────────────────────────────────────────────────┘
```
- **Clock**: Left-aligned `9:28`, font size $14\text{px}$ Semibold.
- **App Notification Glyph**: Small Zola icon `[App: Zola]` representing ongoing background notifications.
- **System Metrics**: Right-aligned cellular protocol `5G`, 4 signal strength bars `[||||]`, and capsule battery glyph with percentage `[Batt: 69%]`.
- **Top Bar Surface**: Blends seamlessly into the primary Electric Blue header (`#0088FF`).

---

## 2. Screen 1: Main Chat List / Inbox (`ZolaInboxView`)

> **Primary Tab**: `Tin nhắn` (Active in bottom navigation with red badge `[Badge: 4]`).  
> **Key Capabilities**: Global search, QR scanner shortcut, quick create menu, priority/others tabs, pinned conversations, multi-avatar group previews, unread badges, and muted states.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 9:28 [App: Zola]                           [Signal: 5G] [||||] [Batt: 69%] │
├────────────────────────────────────────────────────────────────────────┤
│ [Search]  Tìm kiếm                                  [QR]     [ + ]     │
├────────────────────────────────────────────────────────────────────────┤
│   Ưu tiên                                 Khác [•]                     │
│ ════════════                              ────────                     │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Thỏ Con]       Bé Thỏ Con                           [Pin] 2 phút │
│                      Bạn: Tối mai chỗ cũ nhé...                        │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Group Team]    Alpha Team BA & Dev                  [Pin] 3 phút │
│                      Linh Đỗ: Sếp duyệt ngân sách tăng ca... [Badge: 1]│
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Group Ngoại]   Gia Đình Ngoại                      [Pin] 24/09   │
│                      Mẹ: Cuối tuần này cả nhà về quê ăn giỗ...         │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Group Nội]     Gia Đình Nội                        [Pin]   T6    │
│                      Bạn: Vâng ạ con nhớ rồi mẹ                        │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Group Bỉm Sữa] Hội Bỉm Sữa Cầu Giấy                [Pin]   T7    │
│                      Thảo Ngân: Cuối tuần các mẹ có rảnh đi cafe ko?   │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Tiệm Hoa]      Tiệm Hoa Tươi Mimosa               [Mute] 7 phút │
│                      Tiệm Hoa: [Hình ảnh] Xác nhận đơn...  [Badge: 5+] │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Group Lớp]     Lớp Mầm Non Tuổi Thơ                       1 giờ  │
│                      Cô Giáo Hà: Thông báo lịch sinh hoạt ngày 14/10...│
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Chị Lan]       Chị Lan                                   12 giờ  │
│                      Bạn: Em gửi file hợp đồng qua mail rồi nhé        │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Chị Phương]    Chị Phương TechLead                       13 giờ  │
│                      Bạn: Em test xong các case kiểm thử rồi ạ         │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Đức Nghĩa]     Đức Nghĩa                                 17 giờ  │
│                      [Emoji: Laughing]                                 │
├────────────────────────────────────────────────────────────────────────┤
│  [Chat: Active]  [Contacts]      [Discovery]      [Timeline]  [Profile]│
│    [Badge: 4]                       [•]              [N]         [!]   │
│     Tin nhắn      Danh bạ        Khám phá          Nhật ký     Cá nhân │
├────────────────────────────────────────────────────────────────────────┤
│                        ═══════ [ - ] ═══════                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Inventory & Layout Tokens (`ZolaInboxView`):
1. **Header Bar ($56\text{px}$)**:
   - Background: Electric Blue (`#0088FF`).
   - Left: `[Search]` icon ($20\text{px}$, white) + Placeholder *"Tìm kiếm"* (white $15\text{px}$, $80\%$ opacity).
   - Right: `[QR]` Scanner icon ($22\text{px}$, white) + `[+]` Add icon ($22\text{px}$, white).
2. **Sub-Header Segmented Tabs ($44\text{px}$)**:
   - Background: Pure White (`#FFFFFF`).
   - Tab 1: *"Ưu tiên"* - Bold $14\text{px}$ `#000000`, underlined with $2\text{px}$ solid `#000000`.
   - Tab 2: *"Khác"* - Regular $14\text{px}$ `#666666`, top-right red alert dot `[•]`.
3. **Chat List Rows ($72\text{px}$ height per row)**:
   - **Avatar Container ($52\text{px}$)**: Circular contact picture or composite 3-avatar circle for groups with counter chip (e.g. `+6`).
   - **Title**: Semibold $15\text{px}$ `#000000` (bold for unread). Supports emojis.
   - **Pin Indicator**: `[Pin]` pushpin glyph ($12\text{px}$, gray `#8A9098`) positioned next to timestamp.
   - **Timestamp**: Regular $11\text{px}$ `#8A9098` (`2 phút`, `24/09`, `T6`, etc.).
   - **Snippet**: Regular $13\text{px}$–$14\text{px}$ `#6B7280` (or darker `#1A202C` for unread). Prefix format: `Bạn: ...` or `[Tên thành viên]: ...`.
   - **Badges**:
     - Red unread pill (`#FF3B30`, white bold $11\text{px}$) e.g. `[Badge: 1]`.
     - Gray muted pill (`#9E9E9E`, white bold $11\text{px}$) e.g. `[Badge: 5+]`.
   - **Mute Glyph**: `[Mute]` bell-with-slash icon ($14\text{px}$, gray `#8A9098`).
4. **Dividers**: Thin line `1px solid #F0F2F5` inset to start at the text column.

---

## 3. Screen 2: Chat Conversation Thread (`ZolaChatThreadView`)

> **Context**: Group Chat *"Alpha Team BA & Dev"*  
> **Key Capabilities**: Back navigation, group info header, sticker mascot, floating timestamp capsules, multi-colored participant names, message bubbles with reactions, quick-heart action, and multi-tool bottom input bar.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 9:28 [App: Zola]                           [Signal: 5G] [||||] [Batt: 69%] │
├────────────────────────────────────────────────────────────────────────┤
│ [Back]  Alpha Team BA & Dev                        [+User] [Search] [Menu]│
│         Bấm để xem thông tin                                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                      ┌──────────────────────┐                          │
│                      │   [ Sticker Cat:     │                          │
│                      │    Ami Mập Sleeping ]│                          │
│                      └──────────────────────┘                          │
│                                                                        │
│                              [ 10:56 ]                                 │
│                                                                        │
│ [Avt: Nam]   ┌───────────────────────────────────────────────┐         │
│              │ Tuấn Nam (#B45309 Amber)                      │         │
│              │ Khách hàng chê bản demo UI đợt này quá        │         │
│              │ nhiều lỗi                                     │         │
│              └───────────────────────────────────────────────┘         │
│                                        ┌────────────┐                  │
│                                        │ [Like: 1]  │ [Heart-Outline]  │
│                                        └────────────┘                  │
│              ┌────────────────────────┐                                │
│              │ căng ghê               │                                │
│              │ 11:00                  │                                │
│              └────────────────────────┘                                │
│                                                                        │
│                        [ 13:14 13/10/2026 ]                            │
│                                                                        │
│ [Avt: Chị Mai]┌───────────────────────────────────────────────┐        │
│              │ Chị Mai QLDA (#007A5A Green)                  │         │
│              │ Thế chắc đợt này phải cày OT bù tiến độ rồi   │         │
│              │ 13:14                                         │         │
│              └───────────────────────────────────────────────┘         │
│                                        ┌────────────┐                  │
│                                        │ [Laugh: 1] │ [Heart-Outline]  │
│                                        └────────────┘                  │
│                                                                        │
│                        [ 22:10 13/10/2026 ]                            │
│                                                                        │
│ [Avt: Chị Mai]┌───────────────────────────────────────────────┐        │
│              │ Chị Mai QLDA (#007A5A Green)                  │         │
│              │ Uhm nghe bảo deadline chốt ngày 20 tháng này  │         │
│              └───────────────────────────────────────────────┘         │
│                                        ┌────────────┐                  │
│                                        │ [Surp: 2]  │ [Heart-Outline]  │
│                                        └────────────┘                  │
│              ┌────────────────────────┐                                │
│              │ Mệt ghê [Sweat-Smile]  │                                │
│              │ 22:10                  │                                │
│              └────────────────────────┘                                │
│                             ┌────────────┐                             │
│                             │ [Heart: 5] │ [Heart-Outline]             │
│                             └────────────┘                             │
│                                                                        │
│                         [ 09:24 Hôm nay ]                              │
│                                                                        │
│ [Avt: Linh]  ┌───────────────────────────────────────────────┐         │
│              │ Linh Đỗ (#2563EB Royal Blue)                  │         │
│              │ Sếp duyệt ngân sách tăng ca 200% rồi đó c =)))│         │
│              │ 09:24                                         │         │
│              └───────────────────────────────────────────────┘         │
│                                                       [Heart-Outline]  │
├────────────────────────────────────────────────────────────────────────┤
│ [Sticker]  Tin nhắn                             [ ••• ]  [Mic]  [Image]│
├────────────────────────────────────────────────────────────────────────┤
│                        ═══════ [ - ] ═══════                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Inventory & Layout Tokens (`ZolaChatThreadView`):
1. **Header Bar ($56\text{px}$)**:
   - Background: Electric Blue (`#0088FF`).
   - Left: `[Back]` arrow ($24\text{px}$, white).
   - Title Column:
     - Group Title: Bold $16\text{px}$ `#FFFFFF` (*"Alpha Team BA & Dev"*).
     - Subtitle: Regular $12\text{px}$ `#FFFFFF` with $85\%$ opacity (*"Bấm để xem thông tin"*).
   - Right Action Suite ($22\text{px}$ icons, white): `[+User]` (add member), `[Search]` (search conversation), `[Menu]` (hamburger options).
2. **Conversation Canvas**:
   - Background: Cool Gray-Blue (`#E5EBF0`).
   - **Floating Time Capsules**:
     - Shape: Rounded capsule pill (`border-radius: 12px`, padding $3\text{px} \times 10\text{px}$).
     - Background: Semi-transparent Slate Gray (`#B4B9BF`).
     - Text: Pure White (`#FFFFFF`), Regular $11\text{px}$.
     - Formats: `10:56`, `13:14 13/10/2026`, `22:10 13/10/2026`, `09:24 Hôm nay`.
   - **Incoming Message Bubbles**:
     - Avatar: $32\text{px}$ circular avatar on the far left.
     - Container: Pure White (`#FFFFFF`), `border-radius: 14px` (top-left $4\text{px}$).
     - Maximum Width: $75\%$ screen width.
     - Shadow: Subtle ambient drop `0 1px 2px rgba(0,0,0,0.06)`.
     - **Participant Name Coloring**:
       - Tuấn Nam: Amber / Rust (`#B45309`), Bold $12\text{px}$.
       - Chị Mai QLDA: Dark Teal / Emerald (`#007A5A`), Bold $12\text{px}$.
       - Linh Đỗ: Royal Cobalt Blue (`#2563EB`), Bold $12\text{px}$.
     - Message Text: Regular $14\text{px}$ `#0F172A`, line-height $1.45$.
     - Timestamp: Subtitle inside bubble, Regular $11\text{px}$ `#8A9098`.
   - **Floating Reaction Badges**:
     - Position: Overlapping bottom-right edge of bubble.
     - Container: White pill (`#FFFFFF`), border `1px solid #E2E8F0`, shadow `0 1px 3px rgba(0,0,0,0.1)`.
     - Contents: Reaction icon + counter (`[Like: 1]`, `[Laugh: 1]`, `[Surp: 2]`, `[Heart: 5]`).
     - Quick Reaction Button: Circular outline heart `[Heart-Outline]` ($16\text{px}$, gray `#8A9098`).
3. **Bottom Input Toolbar ($52\text{px}$)**:
   - Background: Pure White (`#FFFFFF`), top border `1px solid #E2E8F0`.
   - Left: `[Sticker]` face icon ($24\text{px}$, gray `#64748B`).
   - Center: Flat text entry field with placeholder *"Tin nhắn"* ($14\text{px}$ `#8A9098`).
   - Right:
     - `[ ••• ]` More actions ($22\text{px}$, gray `#64748B`).
     - `[Mic]` Voice note recorder ($22\text{px}$, gray `#64748B`).
     - `[Image]` Media gallery picker ($22\text{px}$, gray `#64748B`).

---

## 4. Screen 3: Address Book / Contacts (`ZolaContactsView`)

> **Primary Tab**: `Danh bạ` (Active in bottom navigation).  
> **Key Capabilities**: Contact search, add friend/group shortcuts, filter pills ("Tất cả", "Bạn bè", "OA"), and alphabetical directory grouping.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 9:28 [App: Zola]                           [Signal: 5G] [||||] [Batt: 69%] │
├────────────────────────────────────────────────────────────────────────┤
│ [Search]  Tìm kiếm                                [+Group]  [+Friend]  │
├────────────────────────────────────────────────────────────────────────┤
│ ( Tất cả )      ( Bạn bè )      ( OA )                                 │
├────────────────────────────────────────────────────────────────────────┤
│ A                                                                      │
│                                                                        │
│ [Avt: A Bách]        Anh Bách QLDA                    [Phone]  [Video] │
│                                                                        │
│ [Avt: A Bình 1]      Anh Bình Sales                   [Phone]  [Video] │
│                                                                        │
│ [Avt: A Bình 2]      Anh Bình Thợ Điện                [Phone]  [Video] │
│                                                                        │
│ [Avt: A Cường 1]     Anh Cường Kỹ Thuật               [Phone]  [Video] │
│                                                                        │
│ [Avt: A Cường 2]     Anh Cường IT                     [Phone]  [Video] │
│                                                                        │
│ [Avt: A Đăng]        Anh Đăng Đối Tác                 [Phone]  [Video] │
│                                                                        │
│ [Avt: A Đức Anh]     Anh Đức Gara Xe                  [Phone]  [Video] │
├────────────────────────────────────────────────────────────────────────┤
│  [Chat]          [Contacts: Active] [Discovery]   [Timeline]  [Profile]│
│    [Badge: 3]                          [•]           [N]         [!]   │
│   Tin nhắn            Danh bạ       Khám phá       Nhật ký     Cá nhân │
├────────────────────────────────────────────────────────────────────────┤
│                        ═══════ [ - ] ═══════                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Inventory & Layout Tokens (`ZolaContactsView`):
1. **Header Bar ($56\text{px}$)**:
   - Background: Electric Blue (`#0088FF`).
   - Left: `[Search]` icon + *"Tìm kiếm"* input field ($15\text{px}$, white).
   - Right: `[+Group]` (add group icon) + `[+Friend]` (add single contact icon).
2. **Filter Pills Row ($48\text{px}$)**:
   - Background: Pure White (`#FFFFFF`), horizontal scroll padding $12\text{px} \times 16\text{px}$.
   - Capsule 1: `( Tất cả )` - Active: Fill `#E4E6EB`, text `#050505` Medium $13\text{px}$, border-radius $16\text{px}$.
   - Capsule 2: `( Bạn bè )` - Inactive: Border `1px solid #D1D5DB`, text `#6B7280` Medium $13\text{px}$.
   - Capsule 3: `( OA )` - Inactive: Border `1px solid #D1D5DB`, text `#6B7280` Medium $13\text{px}$.
3. **Alphabetical Directory**:
   - Section Index Header: *"A"* (Semibold $12\text{px}$ `#64748B`, padding $8\text{px} \times 16\text{px}$).
   - Rows: $40\text{px}$ avatar, contact name, and right action buttons `[Phone]` and `[Video]`.

---

## 5. Screen 4: User Profile & Ecosystem Hub (`ZolaProfileView`)

> **Primary Tab**: `Cá nhân` (Active in bottom navigation with red alert badge `[Badge: !]`).  
> **Key Capabilities**: Profile identity card, status badge selector, ecosystem services (*zBusiness*, *zCloud*, *zStyle*), local storage tools (*My Documents*, *Dữ liệu trên máy*, *Ví QR*), and security/privacy settings.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 9:28 [App: Zola]                           [Signal: 5G] [||||] [Batt: 69%] │
├────────────────────────────────────────────────────────────────────────┤
│ [Search]  Tìm kiếm                                           [Gear: !] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                         ( [Smile] Trạng thái... )                      │
│                                                                        │
│                              ┌──────────┐                              │
│                              │  [Avt:   │                              │
│                              │  Thịnh   │                              │
│                              │   Minh]  │                              │
│                              └──────────┘                              │
│                                                                        │
│                            Hoàng Minh  >                               │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ [Briefcase: Blue]  zBusiness                                           │
│                    Tài khoản chuyên nghiệp, mở rộng kết nối            │
├────────────────────────────────────────────────────────────────────────┤
│ [Cloud: Blue]      zCloud                                            > │
│                    Không gian lưu trữ dữ liệu trên đám mây             │
├────────────────────────────────────────────────────────────────────────┤
│ [Wand: Blue]       zStyle – Nổi bật trên Zola                          │
│                    Hình nền và nhạc cho cuộc gọi Zola                  │
├────────────────────────────────────────────────────────────────────────┤
│ ══════════════════════════════════════════════════════════════════════ │
│ (Inset Divider Bar: 8px #F0F2F5)                                       │
├────────────────────────────────────────────────────────────────────────┤
│ [Folder: Blue]     My Documents                                      > │
│                    Lưu trữ các tin nhắn quan trọng                     │
├────────────────────────────────────────────────────────────────────────┤
│ [Clock: Blue]      Dữ liệu trên máy                                  > │
│                    Quản lý dữ liệu Zola của bạn                        │
├────────────────────────────────────────────────────────────────────────┤
│ [Wallet: Blue]     Ví QR                                               │
│                    Lưu trữ và xuất trình các mã QR quan trọng          │
├────────────────────────────────────────────────────────────────────────┤
│ ══════════════════════════════════════════════════════════════════════ │
│ (Inset Divider Bar: 8px #F0F2F5)                                       │
├────────────────────────────────────────────────────────────────────────┤
│ [Shield: Blue]     Tài khoản và bảo mật                              > │
├────────────────────────────────────────────────────────────────────────┤
│ [Lock: Blue]       Quyền riêng tư                                    > │
├────────────────────────────────────────────────────────────────────────┤
│  [Chat]          [Contacts]         [Discovery]   [Timeline] [Profile:Active]│
│    [Badge: 3]                          [•]           [N]         [!]   │
│   Tin nhắn        Danh bạ           Khám phá      Nhật ký     Cá nhân  │
├────────────────────────────────────────────────────────────────────────┤
│                        ═══════ [ - ] ═══════                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Inventory & Layout Tokens (`ZolaProfileView`):
1. **Header Bar ($56\text{px}$)**:
   - Background: Electric Blue (`#0088FF`).
   - Left: `[Search]` icon + *"Tìm kiếm"* placeholder ($15\text{px}$, white).
   - Right: `[Gear: !]` Settings gear icon with red exclamation mark badge `[!]`.
2. **Profile Header Card**:
   - Background: Pure White (`#FFFFFF`), centered vertical arrangement.
   - Status Button: Pill button `( [Smile] Trạng thái... )` with border `1px solid #E2E8F0`, text $12\text{px}$ `#475569`.
   - Avatar: Large circular picture ($72\text{px}$–$80\text{px}$ diameter).
   - User Name: *"Hoàng Minh"* (Bold $17\text{px}$ `#0F172A`) accompanied by gray chevron `>`.
3. **Ecosystem & Utility Menu Cards**:
   - Left Icon: Vector glyphs in Electric Blue (`#0088FF`), $22\text{px}$–$24\text{px}$.
   - Title: Medium $15\text{px}$ `#0F172A`.
   - Subtitle: Regular $12\text{px}$–$13\text{px}$ `#64748B`.
   - Right: Navigation chevron `>` ($16\text{px}$, gray `#94A3B8`).
4. **Dividers**: Solid light gray divider bars ($8\text{px}$ height, `#F0F2F5`) separating the three functional card clusters.

---

## 6. Investigation & Forensic Touch Targets

| Screen | Interactive Element | Forensic Mechanism & Clue Reveal |
|---|---|---|
| `ZolaInboxView` | Chat row *"Bé Thỏ Con"* (`CLUE-ZOLA-01`) | Disguised lover contact; preview shows suspicious chat snippet; tapping opens full romantic history. |
| `ZolaInboxView` | Search input `[Search]` (`CLUE-ZOLA-02`) | Typing the 4-digit PIN reveals hidden conversation *"Tin nhắn bị ẩn"*. |
| `ZolaChatThreadView` | Message bubble *"Tuấn Nam"* or *"Linh Đỗ"* | Tapping allows the wife to execute **Ghim Bằng Chứng**, copying the message into **Sổ Tay Bắt Ghen Của Vợ**. |
| `ZolaContactsView` | Contact row *"Anh Bách QLDA"* | Disguised professional title masking an extramarital contact or weekend hotel booker. |
| `ZolaProfileView` | Item *"My Documents"* (`CLUE-ZOLA-07`) | Contains backed-up photos and archived receipts disguised as work files. |

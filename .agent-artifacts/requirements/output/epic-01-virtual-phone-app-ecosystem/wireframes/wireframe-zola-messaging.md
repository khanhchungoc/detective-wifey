# Zola - Private Messaging App ASCII Wireframe Specification

**App ID**: `zola`  
**App Name**: Zola (Parody of Zalo)  
**Parent Epic**: [`epic-01-virtual-phone-app-ecosystem`](../epic.md)  
**Related User Story**: [`us-003-zola-private-messaging-app-module.md`](../us-003-zola-private-messaging-app-module.md)  
**Parent Specification**: [internet-messaging/app-design.md](../../../project-knowledge-base/solution-context/apps/internet-messaging/app-design.md)  
**Functional Features**: [internet-messaging/features.md](../../../project-knowledge-base/solution-context/apps/internet-messaging/features.md)  
**Viewport Target**: Mobile Portrait Viewport (393px × 852px base)  
**Design Standard**: Strict Zalo Mobile App Layout, Typography Hierarchy, and Color System  
**Zero-Emoji Invariant**: Adheres strictly to bracketed semantic tokens (`[Search]`, `[QR]`, `[+]`, `[Back]`, `[Phone]`, `[Avt: ...]`, `[Pin]`, etc.)  
**User Decision Delta**: Renamed app to Zola; voice memos excluded; PIN-protected hidden chat marked TBC / conditional; includes Chat Threads, Cloud Documents, Contacts, and lightweight Profile view.

---

## 1. Physical Device Chrome & In-App Header

```
┌────────────────────────────────────────────────────────────────────────┐
│ 9:28 [App: Zola]                           [Signal: 5G] [||||] [Batt: 69%] │
└────────────────────────────────────────────────────────────────────────┘
```
- **Clock**: Left-aligned `9:28`, font size 14px Semibold.
- **Top Bar Surface**: Electric Blue (`#0088FF`).
- **Status Indicators**: Right-aligned cellular protocol `5G`, 4 signal bars `[||||]`, and battery glyph `[Batt: 69%]`.

---

## 2. Screen 1: Main Chat List / Inbox (`ZolaInboxView`)

> **Primary Tab**: `Tin nhắn` (Active in bottom navigation with red alert badge `[Badge: 4]`).  
> **Key Capabilities**: Global search input, priority/others tabs, pinned conversations, disguised contacts, unread count badges, and muted states.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 9:28 [App: Zola]                           [Signal: 5G] [||||] [Batt: 69%] │
├────────────────────────────────────────────────────────────────────────┤
│ [Search]  Tìm kiếm (Nhập tên hoặc số điện thoại)        [QR]     [ + ] │
├────────────────────────────────────────────────────────────────────────┤
│   Ưu tiên                                 Khác [•]                     │
│ ════════════                              ────────                     │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Thợ Điện]      Anh Tuấn Thợ Điện                    [Pin] 2 phút │
│                      Bạn: Tối mai chỗ cũ nhé sếp...                    │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Lan Anh]       Lan Anh Kế Toán                      [Pin] 15 phút│
│                      Lan Anh: Quỹ đen gom được 10 củ rồi... [Badge: 2] │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Group Team]    Alpha Team BA & Dev                  [Pin] 35 phút│
│                      Linh Đỗ: Sếp duyệt ngân sách tăng ca...           │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Group Ngoại]   Gia Đình Ngoại                       [Pin] 24/09  │
│                      Mẹ: Cuối tuần này cả nhà về quê ăn giỗ...         │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Tiệm Hoa]      Tiệm Hoa Tươi Mimosa               [Mute] 2 giờ   │
│                      Tiệm Hoa: [Hình ảnh] Xác nhận đơn hàng [Badge: 5+]│
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Group Lớp]     Lớp Mầm Non Tuổi Thơ                       5 giờ  │
│                      Cô Giáo Hà: Thông báo lịch sinh hoạt ngày 14/10...│
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Đức Nghĩa]     Đức Nghĩa                                  17 giờ │
│                      Haha mai nhớ qua sớm nhé                          │
├────────────────────────────────────────────────────────────────────────┤
│  [Chat: Active]  [Contacts]      [Discovery]      [Timeline]  [Profile]│
│    [Badge: 4]                                                [Light]   │
│     Tin nhắn      Danh bạ        Khám phá          Nhật ký     Cá nhân │
├────────────────────────────────────────────────────────────────────────┤
│                        ═══════ [ - ] ═══════                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Details (`ZolaInboxView`):
1. **Search Header (56px)**:
   - Background: Electric Blue (`#0088FF`).
   - Left: `[Search]` icon (20px, white) + Placeholder *"Tìm kiếm..."*.
   - Right: `[QR]` Scanner icon (22px) + `[+]` Add icon (22px).
   - *Note on PIN-protected hidden chat*: Flagged as TBC; search bar accepts 4-digit PIN query when enabled in higher levels.
2. **Sub-Header Filter Tabs (44px)**:
   - Tab 1: *"Ưu tiên"* - Active bold 14px, underlined with 2px solid `#000000`.
   - Tab 2: *"Khác"* - Inactive regular 14px `#666666`, red alert dot `[•]`.
3. **Chat Rows (72px height per row)**:
   - **Avatar Container (52px)**: Circular avatar with online dot or group composite.
   - **Disguised Contact**: E.g. *"Anh Tuấn Thợ Điện"* (masks affair suspect Hương Marketing).
   - **Badges**: Red unread pill (`#FF3B30`, white bold 11px) e.g. `[Badge: 2]`.
   - **Long-Press Target**: Long-press on any chat row summons universal evidence/suspect pinning action sheet.

---

## 3. Screen 2: Chat Conversation Thread (`ZolaChatThreadView`)

> **Entry Route**: Tapping chat row *"Anh Tuấn Thợ Điện"* from Inbox.  
> **Key Capabilities**: Header call/menu controls, 24h disappearing messages banner (`CLUE-ZOLA-03`), dialogue bubble chain, interactive location card (`CLUE-ZOLA-04`), and text input bar.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 9:28 [App: Zola]                           [Signal: 5G] [||||] [Batt: 69%] │
├────────────────────────────────────────────────────────────────────────┤
│ [< Back]  [Avt: Tuấn] Anh Tuấn Thợ Điện        [Phone] [Video] [Menu]  │
│                       Vừa mới truy cập                                 │
├────────────────────────────────────────────────────────────────────────┤
│           [Clock] Tin nhắn tự xoá sau 24 giờ đã được bật               │
├────────────────────────────────────────────────────────────────────────┤
│                          Hôm nay, 14 tháng 10                          │
│                                                                        │
│ ┌──────────────────────────────────────────────────────┐               │
│ │ Anh gửi catalogue sự kiện Marketing qua Zalo rồi nhé │ 12:45         │
│ │ Trưa nay ăn Cơm Niêu Phố Cổ ngon lắm sếp ơi!         │ [Check: Read] │
│ └──────────────────────────────────────────────────────┘               │
│                                                                        │
│               ┌──────────────────────────────────────────────────────┐ │
│         12:48 │ Mai anh bao lại cafe nhé, trưa nay em trả rồi đó     │ │
│ [Check: Read] └──────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [Map: Pin] Vị trí hiện tại                                         │ │
│ │ Khách sạn Romance Boutique Hotel - P. 402                          │ │
│ │ 12 Ngõ 85 Chùa Láng, Đống Đa, Hà Nội                               │ │
│ │ [Chạm để xem chi tiết bản đồ]                                22:15 │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│               ┌──────────────────────────────────────────────────────┐ │
│         22:18 │ Anh đang kẹt xe đường về, lát anh gọi lại cho sếp... │ │
│ [Check: Read] └──────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌──────────────────────────────────────────────────────┐               │
│ │ Tối nay em dặn sếp ngủ sớm đi nhé [Heart: Red]       │ 23:10         │
│ └──────────────────────────────────────────────────────┘               │
├────────────────────────────────────────────────────────────────────────┤
│ [Sticker]  Nhập tin nhắn...                      [Voice] [Photo] [Send]│
├────────────────────────────────────────────────────────────────────────┤
│                        ═══════ [ - ] ═══════                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Forensic Interaction Notes (`ZolaChatThreadView`):
- **Disappearing Message Banner (`CLUE-ZOLA-03`)**: System notice alerting player that messages auto-purge after 24 hours.
- **Location Pin Card (`CLUE-ZOLA-04`)**: Contrasts husband's alibi (*"kẹt xe đường về"*) with real-time hotel pin (*Romance Boutique Hotel*).
- **Tone & Text Discrepancy (`CLUE-ZOLA-01`)**: Work alias *"Anh Tuấn Thợ Điện"* sending affectionate messages (*"dặn sếp ngủ sớm đi nhé [Heart: Red]"*).
- **Universal Pin Action**: Player long-presses ($\ge 450\text{ms}$) on any message bubble or location card to pin to the Wife's Detective Notebook.

---

## 4. Screen 3: Address Book / Contacts (`ZolaContactsView`)

> **Primary Tab**: `Danh bạ` (Bottom navigation item 2).  
> **Key Capabilities**: Alphabetical contact directory, company department tags, and contact detail cards revealing hidden phone numbers.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 9:28 [App: Zola]                           [Signal: 5G] [||||] [Batt: 69%] │
├────────────────────────────────────────────────────────────────────────┤
│ [Search]  Tìm bạn bè, danh bạ...                           [AddUser]   │
├────────────────────────────────────────────────────────────────────────┤
│ [FriendsIcon]   Lời mời kết bạn                                  [ 1 ] │
│ [PhoneBookIcon] Danh bạ máy (Đồng bộ)                         (342 số) │
├────────────────────────────────────────────────────────────────────────┤
│ A                                                                      │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Bách]          Anh Bách QLDA - Ban Quản Lý Toà Nhà               │
│                      Phòng 402 - Toà Diamond                           │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Tuấn]          Anh Tuấn Thợ Điện                                 │
│                      SĐT: 0988.456.234 • Phòng Marketing Technosoft    │
├────────────────────────────────────────────────────────────────────────┤
│ B                                                                      │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Bảo Vệ]        Bác Bảo Vệ Chung Cư                               │
│                      Trực ca đêm sảnh B                                │
├────────────────────────────────────────────────────────────────────────┤
│ H                                                                      │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Hương]         Hương Marketing (Đã bị ẩn/Chặn)                   │
│                      Nhấn để quản lý liên lạc chặn                     │
├────────────────────────────────────────────────────────────────────────┤
│ L                                                                      │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Lan Anh]       Lan Anh Kế Toán                                   │
│                      Phòng Tài Chính Kế Toán                           │
├────────────────────────────────────────────────────────────────────────┤
│  [Chat]          [Contacts: Active] [Discovery]   [Timeline]  [Profile]│
│     Tin nhắn          Danh bạ        Khám phá      Nhật ký     Cá nhân │
├────────────────────────────────────────────────────────────────────────┤
│                        ═══════ [ - ] ═══════                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Forensic Interaction Notes (`ZolaContactsView`):
- **Cross-App Clue Verification**: *"Anh Tuấn Thợ Điện"* displays company affiliation *"Phòng Marketing Technosoft"* and phone `0988.456.234`, matching bank transfer beneficiary Napas ID.

---

## 5. Screen 4: User Profile & Cloud Document Hub (`ZolaProfileView`)

> **Primary Tab**: `Cá nhân` (Bottom navigation item 5 - Lightweight implementation).  
> **Key Capabilities**: Husband user profile header, Cloud Storage / "Tài liệu Cloud" (holding archived receipts and backup photos - `CLUE-ZOLA-07`), privacy & security settings.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 9:28 [App: Zola]                           [Signal: 5G] [||||] [Batt: 69%] │
├────────────────────────────────────────────────────────────────────────┤
│ [< Back]                   Trang cá nhân                       [Gear]  │
├────────────────────────────────────────────────────────────────────────┤
│ [Avt: Hoang]   Nguyễn Huy Thịnh                                        │
│                Tài khoản Zola: hoang_tech88 • Xem trang cá nhân >      │
├────────────────────────────────────────────────────────────────────────┤
│ TIỆN ÍCH LƯU TRỮ                                                       │
├────────────────────────────────────────────────────────────────────────┤
│ [CloudIcon]    Cloud của tôi (My Documents)                    [Badge] │
│                Lưu trữ tin nhắn bí mật, hình ảnh và tài liệu sao lưu > │
├────────────────────────────────────────────────────────────────────────┤
│ CÀI ĐẶT & BẢO MẬT (LIGHTWEIGHT)                                        │
├────────────────────────────────────────────────────────────────────────┤
│ [ShieldIcon]   Quyền riêng tư & Chặn liên lạc                        > │
│                1 liên hệ trong danh sách ẩn                            │
├────────────────────────────────────────────────────────────────────────┤
│ [KeyIcon]      Mã khóa màn hình & Tin nhắn ẩn (TBC)                  > │
│                Khóa bằng mã PIN 4 số                                   │
├────────────────────────────────────────────────────────────────────────┤
│  [Chat]          [Contacts]      [Discovery]      [Timeline]  [Profile: Active]│
│     Tin nhắn      Danh bạ        Khám phá          Nhật ký     Cá nhân │
├────────────────────────────────────────────────────────────────────────┤
│                        ═══════ [ - ] ═══════                           │
└────────────────────────────────────────────────────────────────────────┘
```

### Screen 4.1: Cloud Document Viewer Drawer (`ZolaCloudDocDrawer`)

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Đóng ✕]           CLOUD CỦA TÔI - TÀI LIỆU SAO LƯU                    │
├────────────────────────────────────────────────────────────────────────┤
│ [DocIcon]  Hop_dong_thue_nha_Chua_Lang.pdf                   14/10/2026│
│            Dung lượng: 1.4 MB • Người thuê: Nguyen Huy Thinh           │
├────────────────────────────────────────────────────────────────────────┤
│ [ImgIcon]  Bien_nhan_coc_can_ho_mini.jpg                     12/10/2026│
│            Dung lượng: 840 KB • Đặt cọc phòng 402 Chùa Láng            │
├────────────────────────────────────────────────────────────────────────┤
│ [ ➕ Ghim tài liệu vào Sổ Tay Bắt Ghen ]                                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Touch Target & Accessibility Grid

| Screen | Target Element | Min Size | Action | Clue Ref |
|---|---|---|---|---|
| `ZolaInboxView` | Chat row *"Anh Tuấn Thợ Điện"* | 393px × 72px | Opens chat thread | `CLUE-ZOLA-01` |
| `ZolaInboxView` | Chat row *"Lan Anh Kế Toán"* | 393px × 72px | Opens decoy thread | Red Herring |
| `ZolaChatThreadView` | Location Pin Bubble | 340px × 80px | Expands map modal / allows pin | `CLUE-ZOLA-04` |
| `ZolaChatThreadView` | Disappearing Notice | 300px × 28px | Inspects auto-delete timer | `CLUE-ZOLA-03` |
| `ZolaContactsView` | Contact *"Anh Tuấn Thợ Điện"* | 393px × 60px | Reveals phone & dept | Traceability |
| `ZolaProfileView` | Item *"Cloud của tôi"* | 393px × 56px | Opens backup doc drawer | `CLUE-ZOLA-07` |
| Universal | Any text bubble or doc item | $\ge 44 \times 44$px | Long-press ($\ge 450$ms) to pin evidence | Universal Pin |


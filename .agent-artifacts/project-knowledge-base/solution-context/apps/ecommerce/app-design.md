---
type: App Design Specification
app_id: poshee
app_name: Shopoo
real_world_parody: E-Commerce Platforms (Shopee Satire)
status: approved
description: "Authoritative branding, UI/UX visual design system, color tokens, typography, component inventory, and screen layout specifications for the Shopoo e-commerce app, streamlined for satirical detective gameplay."
tags: [app-design, poshee, shopee, ecommerce, ui-ux, design-system, branding, wireframe, color-tokens, typography]
timestamp: "2026-10-14T12:42:00+07:00"
---

# Shopoo - App Design & UI/UX Specification

---

## 1. Brand Identity & Reference Architecture

| Attribute | Specification |
|---|---|
| **App Name** | **Shopoo** (Satirical parody of mainstream Southeast Asian e-commerce platforms) |
| **Real-World Parody** | Shopee Mobile Platform (Sea Group) - satirized and streamlined for detective forensic gameplay. |
| **Design Mandate** | **Streamlined Parody Fidelity**: Shopoo retains the iconic coral-orange aesthetic, high-density deal cards, 4-stage order fulfillment tracking pipeline, in-app seller chat with embedded product cards, and multi-channel logistics notifications. Peripheral feature bloat (*Deals*, *Mall*, *Live/Video streams*, and *Financial micro-lending / Dịch vụ tài chính*) is intentionally eliminated to focus player cognition strictly on forensic clue discovery. |
| **Integrated Sub-Brands** | **ShopooPay** (satirical e-wallet), **ShopooVIP** (membership tier), **Shopoo Xử Lý** / **SPX** (logistics courier parodying *Shopee Express*), **Sổ Tay Bắt Ghen Của Vợ** (in-game evidence tagging integration). |
| **Slogan / Tagline** | *"Mua gì cũng rẻ - Ship tận tay ai?"* |
| **Visual Persona** | **The Paper-Trail Honeytrap**: A vibrant consumer shopping app filled with flash-sale countdowns, order tracking alerts, and innocent household deliveries-beneath which lie stealth orders delivered to unfamiliar mini-apartments, suspicious lingerie sizing, and discrete seller chat negotiations. |

---

## 2. Visual Design System & Color Tokens

The color palette adopts high-contrast e-commerce marketplace tones:

```
┌────────────────────────────────────────────────────────────────────────┐
│                         SHOPOO COLOR PALETTE                           │
├────────────────────────────────────────────────────────────────────────┤
│ Primary Brand / Header Orange:  Coral-Orange       #EE4D2D             │
│ Primary Brand Gradient Start:   Vibrant Coral      #FF5722             │
│ Primary Brand Gradient End:     Shopee Red-Orange  #EE4D2D             │
│ Header Overlay Bar:             Pure White Card    #FFFFFF             │
│ Active Tab & Highlight:         Coral-Orange       #EE4D2D             │
│ Inactive Tab / Neutral Icon:    Neutral Slate      #757575             │
│                                                                        │
│ Canvas Background (General):    Off-White Surface  #F5F5F5             │
│ Canvas Background (Lists):      Light Gray         #F8F9FA             │
│ Card Surface:                   Pure White         #FFFFFF             │
│ Section Separator / Divider:    Hairline Gray      #EEEEEE / #F0F2F5   │
│ Border Inset:                   Subtle Border      #E0E0E0             │
│                                                                        │
│ Price Accent & Sale Tag:        Flame Orange       #EE4D2D             │
│ Flash Sale Yellow Accent:       Vivid Gold-Yellow  #FFD166 / #FFA726   │
│ Voucher Xtra Yellow Badge:      Warm Lemon         #FFD600             │
│ In-Transit / Processing Amber:  Warning Amber      #FFA000             │
│ Completed / Delivered Sage:     Forest Sage        #2E7D32             │
│ Unread Badge & Alert Dot:       Vivid Signal Red   #FF3B30 / #EE4D2D   │
│                                                                        │
│ In-App Chat Customer Bubble:    Mint Turquoise     #E0F7FA             │
│ In-App Chat Seller Bubble:      Pure White         #FFFFFF             │
│ In-App Chat Canvas:             Light Warm Gray    #F5F5F5             │
│ Chat Anti-Fraud Banner Bg:      Pale Gold Cream    #FFF8E1             │
│ Chat Anti-Fraud Banner Border:  Soft Amber         #FFE082             │
│ Chat Anti-Fraud Text Accent:    Deep Ochre         #B78103             │
│ Chat System Pill Background:    Light Warm Gray    #EEEEEE             │
│                                                                        │
│ Text Primary (Headings & Body): Dark Charcoal      #212121             │
│ Text Secondary (Subtitles):     Accessible Slate   #52525B (≥4.5:1 AA) │
│ Text Tertiary (Timestamps):     Accessible Muted   #64748B (≥4.5:1 AA) │
│ Text Inverted / Header:         Pure White         #FFFFFF             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Typography System

Shopoo inherits the universal Apple HIG `text-ios-*` dynamic scale ([design.md §3.1.1](../../design-system/design.md#311-universal-shared-typography-scale-vs-scoped-app-font-color-invariant)) paired with Shopoo coral-orange brand tokens:

| Level / UI Element | Canonical Token (`text-ios-*`) | Weight | Color | Line Height / Notes |
|---|---|---|---|---|
| **Status Bar Clock & Metrics** | `text-ios-subheadline` ($15\text{px}$) | Semibold ($600$) | `#FFFFFF` | Governed by OS `StatusBar` (zero carrier text) |
| **Search Input Text & Placeholder** | `text-ios-footnote` ($13\text{px}$) | Regular ($400$) | `#52525B` | White capsule pill, camera icon on right |
| **Header Action Counter Badges** | `text-ios-caption-2` ($11\text{px}$) | Semibold ($600$) | `#FFFFFF` on `#EE4D2D` | Capsule badge `[Cart: 12]`, `[Chat: 4]` |
| **Carousel / Deal Headlines** | `text-ios-subheadline` ($15\text{px}$) | Semibold ($600$) | `#FFFFFF` / `#212121` | High-impact promotional callouts |
| **Service Grid Label** | `text-ios-caption-2` ($11\text{px}$) | Semibold ($600$) | `#212121` | 2 lines max under $40\text{px}$ icon |
| **Product Card Title** | `text-ios-footnote` ($13\text{px}$) | Regular ($400$) | `#212121` | 2-line clamp with ellipsis |
| **Product Price Tag** | `text-ios-callout` ($16\text{px}$) | Semibold ($600$) | `#EE4D2D` | `tabular-nums`, preceded/followed by `đ` |
| **Discount Percentage Pill** | `text-ios-caption-2` ($11\text{px}$) | Semibold ($600$) | `#B91C1C` on `#FFEBEE` | e.g. `-15%`, `-30%` ($\ge 4.5:1$ contrast) |
| **Sales Count / Rating** | `text-ios-caption-1` ($12\text{px}$) | Medium ($500$) | `#52525B` | e.g. `★ 5.0  Đã bán 120` |
| **Order Status Badge** | `text-ios-caption-2` ($11\text{px}$) | Semibold ($600$) | `#2E7D32` / `#B45309` | Inset rounded tag inside card |
| **Profile Username** | `text-ios-headline` ($17\text{px}$) | Semibold ($600$) | `#FFFFFF` | Beside membership tier badge (`hoang_minh92`) |
| **Membership Tier Badge** | `text-ios-caption-2` ($11\text{px}$) | Semibold ($600$) | `#FFFFFF` on `#455A64` | e.g. *"Kim Cương >"* |
| **Order Pipeline Status Label** | `text-ios-caption-1` ($12\text{px}$) | Medium ($500$) | `#212121` | Under 4 icons: Chờ xác nhận/lấy/giao/đánh giá |
| **Chat Message Text** | `text-ios-subheadline` ($15\text{px}$) | Regular ($400$) | `#212121` | Comfortable mobile readability |
| **Chat Product Card Title** | `text-ios-footnote` ($13\text{px}$) | Semibold ($600$) | `#212121` | Pinned inside message feed |
| **Chat Warning Notice Text** | `text-ios-caption-1` ($12\text{px}$) | Medium ($500$) | `#52525B` | Amber box with bold warning lead |
| **Bottom Navigation Labels** | `text-ios-caption-2` ($11\text{px}$) | Semibold ($600$) | Active `#EE4D2D` / Inactive `#52525B` | 3 bottom tabs |

---

## 4. Screen Layouts & Component Specifications

### 4.1. Global Chrome & 3-Tab Navigation Bar
* **Top Header Bar**: Height $54\text{px}$–$60\text{px}$, Coral-Orange background (`#EE4D2D` to `#FF5722`). Features branded search input with camera search glyph, right cart icon `[Cart: 12]`, and chat bubble icon `[Chat: 4]`.
* **Bottom Navigation Bar (Streamlined 3-Tab System)**:
  * Height $54\text{px}$, Pure White background (`#FFFFFF`), hairline top border `1px solid #EEEEEE`.
  * **Tab 1: Home** (House icon, active text `#EE4D2D`).
  * **Tab 2: Thông báo** (Bell icon with red badge e.g. `[Badge: 5]`).
  * **Tab 3: Tôi** (User silhouette icon, active when in Profile).
  * *Note: Peripheral tabs (Deals, Mall, Live & Video) are omitted to prevent feature bloat in the game.*
* **Ergonomics & Touch Targets**: All bottom tab buttons $\ge 48\text{px} \times 44\text{px}$. Top navigation icons $\ge 44\text{px} \times 44\text{px}$.

### 4.2. Screen 1: Home Marketplace Feed (`PosheeHomeView`)
* **Header Bar**:
  * Coral-Orange background (`#EE4D2D`).
  * Search box (`#FFFFFF`, $38\text{px}$ height) with search magnifying glass, anonymized placeholder (*"Mô hình Mecha Lắp ráp..."*), and photo camera icon `[Camera]`.
  * Top right: Shopping cart `[Cart: 12]` and Chat bubble `[Chat: 4]`.
* **Floating Quick-Service Bar**:
  * Rounded white card with soft drop shadow ($8\text{px}$ corner radius).
  * QR Code Scanner shortcut `[ -|- ]`.
  * **ShopooPay**: Red icon + *"Gói chào mừng 500k"*.
  * **Điểm danh nhận Xu**: Gold coin icon + *"Để nhận Xu!"*.
  * **Voucher**: Ticket icon + *"Mã giảm 50%"*.
* **Service Ribbon (Horizontal Icon Carousel)**:
  * 6 clean categories: *Thời trang*, *Mỹ phẩm*, *Công nghệ*, *Gia dụng*, *Siêu Rẻ*, *Kho Mã*.
* **Flash Sale & Promo Trio Banners**:
  * 3 equal-width promo cards:
    - Card 1: *FLASH SALE GIỜ VÀNG - HÀNG NGÀN DEAL [MUA NGAY >]*.
    - Card 2: *MỞ DEAL BÍ MẬT - QUÀ TẶNG BẤT NGỜ [XEM NGAY >]*.
    - Card 3: *SIÊU RẺ ĐỒNG GIÁ - CHỈ TỪ 9.000 Đ [MUA NGAY >]*.
* **Masonry Discovery Feed (2 Columns)**:
  * Dual-column cards:
    - Left: Seasonal campaign card (*"NGÀY 15 SALE GIỮA THÁNG - FREESHIP 0Đ"*).
    - Right: Interactive product cards with thumbnail, discount pill (`-15%`), campaign voucher tag (`VOUCHER XTRA`), 2-line title (*"Chuột văn phòng Silent M100"*), 5-star rating, price (`85.000 đ`), and sales count (`Đã bán 120`).

### 4.3. Screen 2: User Profile Hub (`PosheeProfileView` / "Tôi" Tab)
* **Header Profile Banner**:
  * Orange gradient background (`#FF5722` to `#EE4D2D`).
  * Left: Circular user avatar ($54\text{px}$) + Anonymized username *"hoang_minh92"* + VIP tier capsule *"Kim Cương >"* + Follower metrics *"24 Đang theo dõi | 15 Người theo"*.
  * Right: Settings gear icon `[Settings]`, Cart `[Cart: 12]`, Chat bubble `[Chat: 4]`.
  * Sub-banner: Gold VIP savings strip: *"👑 Với ShopooVIP, bạn đã tiết kiệm: 3.450.000đ >"*.
* **Order Processing Pipeline ("Đơn mua")**:
  * Card header: *"Đơn mua"* with right link *"Xem lịch sử mua hàng >"*.
  * 4 horizontal lifecycle states:
    1. `Chờ xác nhận` (Wallet glyph).
    2. `Chờ lấy hàng` (Package box glyph with red badge `[Badge: 1]`).
    3. `Chờ giao hàng` (Truck glyph with red badge `[Badge: 2]` - *Critical clue trigger*).
    4. `Đánh giá` (Star glyph with red badge `[Badge: 3]`).
  * Sub-services: *"Đơn Nạp điện thoại & Thẻ cào"* and *"Đơn Giao Hỏa Tốc"*.
* **Promo Campaign Hub**:
  * 4 round icons: *Trang Chính Sale*, *ShopooVIP*, *Mã Hoàn Xu*, *Kho Voucher*.
* **My Utilities ("Tiện ích của tôi")**:
  * 3 essential items: *Ví ShopooPay* (Số dư: 450.000đ), *Shopoo Xu* (Điểm danh nhận xu [•]), *Kho Voucher* (12 Mã có sẵn [•]).
  * *(Note: "Dịch vụ tài chính" micro-lending section is completely removed).*
* **Other Utilities ("Tiện ích khác")**:
  * Rows: *Shop của tôi >*, *Khách hàng thân thiết >*.

### 4.4. Screen 3: Notifications Hub (`PosheeNotificationView` / "Thông báo" Tab)
* **Header Bar**:
  * Centered title *"Thông báo"* ($17\text{px}$ Semibold).
  * Right: Cart icon `[Cart: 12]` and Chat bubble `[Chat: 4]`.
* **Top Summary Alert Rows**:
  * Row 1: *"Cập nhật Người bán (1) >"*.
  * Row 2: *"Cập nhật đơn hàng (2) >"*.
* **Pinned Order Tracking Cards (Logistics Forensics)**:
  * Card 1: **Đang vận chuyển** (Timestamp: `10:38`).
    - Detail: *"Đơn hàng #PSH-88120 đang vận chuyển và dự kiến giao đến bạn trong hôm nay."*
  * Card 2: **Giao kiện hàng thành công** (Timestamp: `Hôm qua, 18:31`).
    - Detail: *"Kiện hàng SPXVN06801716767A của đơn hàng #PSH-99214 đã giao thành công đến Chung cư mini số 12 ngõ 85... [v]"*
* **Latest Updates Stream ("Cập nhật mới nhất")**:
  * Header with right action *"Đọc Tất Cả"*.
  * Filter category tabs (Live/Video tab removed):
    - `Thông báo nổi bật (3)` (Active red underline).
    - `Khuyến mãi` `[•]`.
    - `Đơn hàng` `[•]`.
    - `Cập nhật Shopoo` `[•]`.
  * Notification Item Feed:
    - Voucher announcement alerts (*"Mã giảm 50% cho ngành hàng Thời trang nữ đã sẵn sàng!"*).
    - Logistics courier departures.
    - Account security advisory (*"🚨 Cảnh báo bảo mật tài khoản: Tuyệt đối KHÔNG chia sẻ mã OTP..."*).

### 4.5. Screen 4: In-App Chat Inbox (`PosheeChatListView` / "Chat")
* **Header Bar**:
  * Orange back arrow `[<]`, Title *"Chat"* ($18\text{px}$ Bold).
* **Segmented Filter Pills**:
  * Pill 1: *"Tất cả"* (Selected: light gray capsule with unread dot `[•]`).
  * Pill 2: *"Đang hoạt động"* (Soft peach background `#FFF3E0`, red text `#EE4D2D`, red dot `[•]`).
* **Chat Conversation Feed (All Live Badges Removed & Anonymized)**:
  * Row 1: **DudeBasic - Official Store**
    - Preview: *"Dạ vâng shop đã gửi hàng rồi ạ"*
    - Date: `19/09` | Red unread badge `[Badge: 1]`.
  * Row 2: **ToyWorld.STORE**
    - Tag: `[Yêu thích]`.
    - Preview: *"Bạn nhận một liên kết sản phẩm."*
    - Date: `19/09` | Red unread badge `[Badge: 2]`.
  * Row 3: **BrickLab Official**
    - Preview: *"Dạ tạm thời shop chỉ còn hộp lẻ thôi ạ"*
    - Date: `19/09`.
  * Row 4: **Lingerie Romance Hanoi**
    - Preview: *"Dạ em đã che tên sản phẩm trên bao bì rồi ạ"*
    - Date: `18/09` (Zero spoiler tags; long-press `380ms` on chat bubble inside thread to pin).

### 4.6. Screen 5: In-App Chat Conversation Detail (`PosheeChatDetailView`)
* **Header Bar**:
  * Orange back arrow `[<]`.
  * Shop avatar + Shop name *"DudeBasic - Official Store"*.
  * Subtitle: *"• Trực tuyến"* ($11\text{px}$ gray).
  * Right: Storefront icon `[Store]`, More options `[•••]`.
* **Anti-Fraud Security Policy Warning Banner**:
  * Light yellow box (`#FFF8E1`), border `#FFE082`, padding $10\text{px} \times 12\text{px}$.
  * Warning icon `⚠️` + Text: *"LƯU Ý: Shopoo KHÔNG cho phép hành vi: Đặt cọc/Chuyển khoản riêng/Giao dịch ngoài nền tảng... Vui lòng chỉ Mua-Bán trực tiếp trên Shopoo để bảo vệ quyền lợi."*
* **Pinned Product Enquiry Card**:
  * Pinned top card: *"Bạn đang hỏi về quy cách sản phẩm"*.
  * Product thumbnail ($64\text{px} \times 64\text{px}$) with sales badge *"Đã bán 36k"*.
  * Product Title: *"Áo thun nam polo basic thoáng khí..."*.
  * Selected SKU: *"TRẮNG, 3XL >"*.
  * Badges: `[Rẻ Vô Địch]`, `[COD]`.
  * Price: `245.000 đ`, discount `-30%`, Free shipping icon `[Freeship]`.
  * Action buttons: Cart shortcut `[Cart]`, Primary CTA button `[Mua với voucher]` in Coral-Orange.
* **Message Thread Canvas**:
  * Date chip: *"19 thg 9"* centered.
  * Automated Shop Greeting (Left, white bubble): *"Cảm ơn Anh/Chị đã quan tâm đến cửa hàng. Mình cần em hỗ trợ gì ạ?"* (Label: *Tin nhắn tự động 20:18*).
  * Customer Inquiry Bubble (Right, mint turquoise bubble `#E0F7FA`): *"Bao h thì về thêm áo này sz 3xl hả shop"* (`20:18` `✓✓`).
  * Divider: *"Tin nhắn chưa đọc"*.
  * Seller Response (Left, white bubble): *"Dạ mẫu này bên em vẫn chưa có kế hoạch cụ thể ngày về thêm ạ"* (`20:44`).
  * System note: *"Hộp thư tự động sẽ phản hồi thêm"*.
* **Quick Prompt Suggestion Chips (Non-Video Shopping Actions)**:
  * `[Hỏi tình trạng còn hàng]`, `[Tư vấn chọn size]`. (Livestream action removed).
* **Chat Input Bar**:
  * Height $52\text{px}$, White background, top hairline border.
  * Left: Plus attachment `[+]`, Product bag selector `[Bag]`.
  * Center: Pill input field with placeholder *"Soạn tin..."*.
  * Right: Emoji smiley selector `[Smile]`.

### 4.7. Screen 6: Order Detail & Shipping Address Inspector (`PosheeOrderDetailDrawer`)
* Slide-up modal drawer for inspecting order invoices.
* Displays order status, tracking number, courier info (SPX), and recipient details:
  - Recipient Name: *"Thu Trang"*, Masked Phone Number: *"(+84) 912 *** 688"*.
  - Delivery Address: *"Chung cư mini số 12 ngõ 85 Chùa Láng, P. Láng Thượng, Đống Đa, HN"*.
  - Itemized list with SKU variants (*"Size S / Màu Đỏ Rượu"*), quantity, and price.
  - **Zero-Spoiler Pinning (`380ms`)**: Static pin buttons are prohibited. Recipient address block and itemized SKU rows are wrapped in `StoryEvidenceTarget` (`380ms` hold or `Enter`/`Space` on keyboard focus) to open `UniversalEvidenceModal`.

### 4.8. Screen 7: Search Keyword Tag Cloud Overlay (`PosheeSearchOverlay`)
* Triggered upon tapping the header search bar.
* Displays recent search chips (*"nội y quyến rũ"*, *"váy body tôn dáng"*, *"quà sinh nhật bạn gái mới quen"*, *"son môi Lior Matte 999"*) with clear history button.

---

## 5. UI Layout Wireframes (ASCII Architecture)

> The complete, pixel-accurate ASCII wireframes conforming strictly to the Zero-Emoji Invariant are maintained in the canonical KB companion:  
> **[`wireframe.md`](./wireframe.md)**.

### 5.1. Summary Overview of the 4 Core Screens

```
┌────────────────────────────────────────────────────────┐
│ SCREEN 1: HOME FEED (HOME)   SCREEN 2: USER PROFILE (TÔI)
│ ┌────────────────────────┐   ┌────────────────────────┐
│ │[🔍 Váy ngủ lụa...][🛒][💬│   │[Avt] hoang_minh [KimCươ│
│ ├────────────────────────┤   ├────────────────────────┤
│ │[QR] ShopooPay | Voucher│   │👑 ShopooVIP Tiết kiệm..│
│ ├────────────────────────┤   ├────────────────────────┤
│ │(Thời trang)(Công nghệ) │   │📦 Đơn mua    Xem tất cả│
│ ├────────────────────────┤   │[Ví] [Hộp 1] [Xe 2] [★ 3]│
│ │[FLASH SALE GIỜ VÀNG]   │   ├────────────────────────┤
│ ├────────────────────────┤   │💳 Tiện ích: ShopooPay..│
│ │Chuột Silent: 85k       │   ├────────────────────────┤
│ ├────────────────────────┤   │[Home]   [Thông báo] [Tôi│
│ │[Home]   [Thông báo] [Tôi   └────────────────────────┘
│ └────────────────────────┘                            
├────────────────────────────────────────────────────────┤
│ SCREEN 3: NOTIFICATIONS      SCREEN 4: CHAT INBOX     │
│ ┌────────────────────────┐   ┌────────────────────────┐
│ │     Thông báo    [🛒][💬│   │[<] Chat                │
│ ├────────────────────────┤   ├────────────────────────┤
│ │Cập nhật đơn hàng (2) > │   │(Tất cả •) (Đang hđ •)  │
│ │[Đang vận chuyển 10:38] │   ├────────────────────────┤
│ │[Giao thành công 18:31] │   │[Shop] DudeBasic  19/09 │
│ ├────────────────────────┤   │  Dạ vâng shop...   (1) │
│ │Cập nhật mới: [Nổi bật] │   │[Shop] ToyWorld   19/09 │
│ │🚨 Cảnh báo bảo mật...  │   │  Bạn nhận 1 link.. (2) │
│ ├────────────────────────┤   ├────────────────────────┤
│ │[Home]   [Thông báo] [Tôi   │[Home]   [Thông báo] [Tôi│
│ └────────────────────────┘   └────────────────────────┘
└────────────────────────────────────────────────────────┘
```

---

## 6. Forensic Clue Mechanics & Parody Integrations

| Clue ID | Component / Screen | Forensic Interaction & Reveal | Marital Narrative / Truth Twist | Difficulty |
|---|---|---|---|---|
| `CLUE-POSH-01` | `PosheeOrderDetailDrawer` • Shipping Address | Inspect order -> Delivered to unfamiliar mini-apartment address (*"Chung cư mini số 12 ngõ 85 Chùa Láng, người nhận: Thu Trang"*). | **Cheating / Sugar Baby**: Husband pays rent and orders household amenities for mistress's apartment. | Medium |
| `CLUE-POSH-02` | `PosheeOrderDetailDrawer` • Sizing Forensics | Inspect SKU variant -> Lingerie / silk nightgown ordered in **Size S**; wife is known to wear **Size L**. | **Cheating**: Physical proof the item was not purchased for the wife. | Easy |
| `CLUE-POSH-03` | `PosheeOrderDetailDrawer` • Recipient Tag | Inspect order -> Luxury vacuum or cosmetics shipped to husband's sister's address (*"Người nhận: Chị Mai - Chị ruột"*). | **Innocent (Red Herring)**: Surprise family gift mistaken for mistress purchase. | Hard |
| `CLUE-POSH-04` | `PosheeSearchOverlay` • Search Tags | Tap search bar -> Tags reveal *"nội y quyến rũ"*, *"váy body tôn dáng"*, *"quà sinh nhật bạn gái mới quen"*. | **Cheating**: Incriminating digital footprints of shopping intent. | Easy |
| `CLUE-POSH-05` | `PosheeChatDetailView` • In-App Seller Chat | Inspect chat thread with seller -> Husband requests discrete packaging (*"Shop che tên sản phẩm trên bao bì giúp mình nhé"*) or asks about Size S fit. | **Cheating**: Direct communication proving husband concealed the delivery content. | Medium |
| `CLUE-POSH-06` | `PosheeNotificationView` • Order Tracking | Inspect "Cập nhật đơn hàng" -> Order delivered successfully at 22:30 to an office or café pickup point. | **Cheating**: Covert delivery schedule avoiding domestic discovery. | Hard |

---

## 7. Authoritative Documents & Companion Artifacts

* **Canonical ASCII Wireframe**: [`wireframe.md`](./wireframe.md)
* **Functional Features & Clue Matrix**: [`features.md`](./features.md)
* **Master App Architecture**: [`../../architecture/apps-features-architecture.md`](../../architecture/apps-features-architecture.md)

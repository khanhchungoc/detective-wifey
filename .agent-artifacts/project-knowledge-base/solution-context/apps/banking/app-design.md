---
type: App Design Specification
app_id: techcornbank
app_name: Techcornbank
real_world_parody: Techcombank Mobile (2024–2026 Redesign) / VietQR
status: approved
description: "Authoritative branding, visual design system, color tokens, typography scale, component inventory, and screen wireframe layouts for Techcornbank, directly updated and verified against authentic Techcombank Mobile redesign screenshots (Dashboard & Recent Activity feeds)."
tags: [app-design, techcornbank, techcombank, banking, ui-ux, design-system, branding, inspire-tier, recent-activity, wireframe]
timestamp: "2026-10-22T21:10:00+07:00"
---

# Techcornbank - App Design & UI/UX Specification

---

## 1. Brand Identity & Parody Architecture

| Attribute | Specification |
|---|---|
| **App Name** | **Techcornbank** (Satirical real-world parody of *Techcombank Mobile* and *VietQR*) |
| **Real-World Reference** | Techcombank Mobile (2024–2026 Modern Redesign) |
| **Slogan / Taglines** | Primary: *"Chuyển tiền siêu tốc - Tin nhắn siêu tình"*<br>Sub-Brand Inspire Motto: *"BE INSPIRED why not!"* |
| **Design Mandate** | **Strict Visual Parity**: Faithfully replicates the visual polish, geometry, vibrant coral/salmon soundwaves, floating rounded hero cards, segmented quick-action matrix, and date-grouped transaction feeds of Techcombank Mobile's latest production interface. |
| **Trademark Defense** | Uses parody naming (*Techcornbank*, *Techcornbank OneU*), modified geometric dual-diamond logo emblem, and comedic fictional memos while maintaining authentic neobank aesthetics. Distinctly differentiates itself from MBBank's navy or MoMo's magenta. |
| **Visual Persona** | **The High-Status Deceptive Neobank**: Sleek, affluent, decluttered neobank interface with case-defined membership tiers (*Inspire*, *Priority*, *Private*) and motivational marketing banners that hilariously contrast with suspicious 1.000 VNĐ micro-transfer apology chats and concealed savings vaults. |

---

## 2. Visual Design System & Color Tokens

The visual palette strictly reflects the authentic color tokens captured from production Techcombank Mobile screenshots:

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                             Techcornbank COLOR PALETTE                            │
├───────────────────────────────────────────────────────────────────────────────────┤
│ Primary Brand Scarlet:      Techcom Red            #ED1C24                        │
│ Brand Crimson Deep:         Dark Red Header/Accent #B71C1C                        │
│ Inflow Green (Tiền vào):    Mint Emerald           #00A86B (Text & Circle Glyphs) │
│ Outflow Dark (Tiền ra):     Carbon Charcoal        #111827 (Text & Circle Glyphs) │
│ Outflow Alert Red:          Crimson Alert          #E53935 (Receipts & Warnings)  │
│                                                                                   │
│ Canvas Background Default:  Light Smoke Neutral    #F5F6F8                        │
│ Canvas Background Inspire:  Warm Peach Gradient    #FFF8F2 → #FFEADF              │
│ Soundwave Pattern Accents:  Coral / Peach Waves    #FFA07A / #FF7F50 / #FF6B6B    │
│ Card Surface Elevated:      Pure White             #FFFFFF (Rounded Cards)        │
│ Card Drop Shadow:           Ambient Soft Glow      rgba(0, 0, 0, 0.08)            │
│ Border & Hairline Dividers: Subtle Cool Gray       #E5E7EB / #F3F4F6              │
│                                                                                   │
│ Text Primary:               Carbon Charcoal        #111827 / #000000              │
│ Text Secondary & Snippets:  Muted Slate            #6B7280                        │
│ Text Date Headers / Minor:  Muted Steel Gray       #8E8E93                        │
│ Active Filter Pill Fill:    Solid Black            #000000                        │
│ Active Filter Pill Text:    Pure White             #FFFFFF                        │
│ Inactive Filter Pill Border:Subtle Outline         #E5E7EB                        │
│ Support / Help Pill Text:   Royal iOS Blue         #007AFF                        │
│ Unread Notification Badge:  Vivid Scarlet Red      #ED1C24                        │
├───────────────────────────────────────────────────────────────────────────────────┤
│                            MEMBERSHIP & TIER FINISHES                             │
├───────────────────────────────────────────────────────────────────────────────────┤
│ Inspire Tier (Youth/Trendy):Vibrant Coral / Gold   #FF6B6B / #FF8E53 / #E85D04    │
│ Priority Tier (Affluent):   Champagne Gold         #C5A880 / #D4AF37              │
│ Private Tier (Ultra):       Obsidian Black Diamond #121212 / #23272A              │
│ Standard Tier:              Slate Titanium         #1E293B / #334155              │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Typography System

Techcornbank adopts modern geometric neobank typography (`SF Pro Display` / `Inter` / system sans-serif) paired with tabular monospace numerals for financial figures:

| UI Element | Font Size | Weight | Color | Line Height / Style Notes |
|---|---|---|---|---|
| **Recent Activity Title (`Hoạt động gần đây`)** | $24\text{px}$–$26\text{px}$ | Bold ($700$/$800$) | `#000000` | Left-aligned, tracking $-0.5\text{px}$ |
| **Date Group Header (`Hôm qua`, `Thứ Ba, 20...`)** | $13\text{px}$–$14\text{px}$ | Regular ($400$) | `#8E8E93` | Uppercase initial, generous top margin |
| **Transaction Counterparty Name** | $15\text{px}$–$16\text{px}$ | Bold ($700$) | `#111827` | All-caps uppercase (e.g. `LE THI KIM CUC`) |
| **Transaction Memo Subtitle** | $13\text{px}$–$14\text{px}$ | Regular ($400$) | `#6B7280` | Single-line truncated with ellipsis |
| **Transaction Amount (Inflow)** | $16\text{px}$–$17\text{px}$ | Bold ($700$) | `#00A86B` | Tabular figures, signed `+ 45,000` |
| **Transaction Amount (Outflow)** | $16\text{px}$–$17\text{px}$ | Bold ($700$) | `#111827` | Tabular figures, signed `- 7,000` |
| **Filter Pill Labels (`7 ngày trước`, etc.)** | $13\text{px}$–$14\text{px}$ | Semibold ($600$) | Active `#FFFFFF` / Inactive `#000000` | Capsule padding: $8\text{px} \times 16\text{px}$ |
| **Floating Help Tooltip (`Không tìm thấy giao dịch?`)** | $12\text{px}$–$13\text{px}$ | Semibold ($600$) | `#007AFF` | Centered 2-line layout |
| **Dashboard Balance Label (`Số dư hiện có`)** | $14\text{px}$–$15\text{px}$ | Medium ($500$) | `#374151` | Subtle muted label |
| **Dashboard Masked Balance (`********`)** | $24\text{px}$–$28\text{px}$ | Bold ($700$) | `#111827` | Tabular monospace asterisks |
| **Tier Upsell Title (`Lên hạng Inspire Max`)** | $15\text{px}$–$16\text{px}$ | Bold ($700$) | `#111827` | Card section headline |
| **Tier Upsell Body Description** | $12\text{px}$–$13\text{px}$ | Regular ($400$) | `#4B5563` | Multi-line explanatory copy |
| **Black CTA Button (`Xem số dư`)** | $13\text{px}$–$14\text{px}$ | Semibold ($600$) | `#FFFFFF` | Rounded capsule pill button |
| **Slogan Script (`why not!`)** | $18\text{px}$–$20\text{px}$ | Cursive Script | Coral `#E85D04` | Stylized cursive signature |
| **Quick Action Grid Labels** | $11\text{px}$–$12\text{px}$ | Medium ($500$) | `#111827` | Centered under $48\text{px}$ round icons |
| **Bottom Navigation Tab Labels** | $10\text{px}$–$11\text{px}$ | Medium / Bold | Active `#111827` / Inactive `#6B7280` | Under 5 primary bottom icons |

---

## 4. Component Inventory & Ergonomics

### 4.1. Directional Transaction Badges
* **Outflow Glyph `(↗)`**: Clean circular outline ($28\text{px} \times 28\text{px}$) with a $45^\circ$ diagonal arrow pointing up-right in carbon dark `#111827`.
* **Inflow Glyph `(↙)`**: Clean emerald green circular outline ($28\text{px} \times 28\text{px}$) with a $45^\circ$ diagonal arrow pointing down-left in emerald green `#00A86B`.

### 4.2. Ergonomics & Touch Targets
* **Sticky Bottom Navigation Bar**: Fixed $64\text{px}$ height bar placed above the safe area, housing 5 evenly distributed tabs with touch targets $\ge 48 \times 48\text{px}$.
* **Quick Action Matrix**: 5-column horizontal row with circular action buttons ($\ge 48 \times 48\text{px}$) featuring light borders and dark icon strokes.
* **Eyeball Privacy Toggle**: $\ge 44 \times 44\text{px}$ hit target to toggle between masked `********` and actual numeric balance.
* **Filter Pills Bar**: Horizontal scrollable container with $36\text{px}$ tall pill chips and touch targets $\ge 44\text{px}$ wide.
* **Floating Assistance Pill**: Elevated floating card ($120 \times 44\text{px}$) in the bottom right corner of the history screen.
* **Border Radiuses**:
  * Hero account cards: $20\text{px}$
  * Floating action cards & modals: $16\text{px}$–$20\text{px}$
  * Quick action buttons: Circular ($50\%$ / fully rounded)
  * Filter pills: Capsule ($9999\text{px}$)
  * Receipt modal: $24\text{px}$ top-corner sheet radius

---

## 5. UI Wireframes & Layout Architecture

### 5.1. Dashboard View (`TechcornbankDashboardView`)

Faithfully captures the authentic Techcombank Mobile Home screen (Image 2 reference):

```text
+-----------------------------------------------------------------+
| 18:58 📍                                                 5G 81% |
+-----------------------------------------------------------------+
| [ (PB) ]                                      [ 🔍 ]   [ 🔔 (9) ]|
|  Inspire                                                        |
|                                                                 |
|   |||||||||||||||||                        BE INSPIRED          |
|   ||| SOUNDWAVE |||                       why not!             |
|   |||||||||||||||||                                             |
|                                                                 |
|       +-------------------------------------------------+       |
|       | Số dư hiện có                                   |       |
|       | ********                             [ 👁️⃥ ]     |       |
|       |                                                 |       |
|       | Lên hạng Inspire Max                            |       |
|       | Duy trì số dư tài khoản bình quân 3 tháng từ    |       |
|       | 30 triệu để lên hạng và tích điểm hoàn tới 25%. |       |
|       |                                  [ Xem số dư ]  |       |
|       +-------------------------------------------------+       |
|                                                                 |
|   [Quét QR Chạm vận may]                                        |
+-----------------------------------------------------------------+
|   ( 🐖 )       ( 📄 )       ( ⚏ )       ( 🔄 )       ( ➔ )      |
|  Gửi tiết    Thanh toán    Quét mã     Sinh lời    Tính năng    |
|    kiệm        hóa đơn       QR        tự động       khác       |
+-----------------------------------------------------------------+
|  🌸 Gửi lời yêu thương (20/10)                               ✕  |
+-----------------------------------------------------------------+
| Dành cho bạn                                                    |
| +-------------------------------------------------------------+ |
| | Khoản gửi đầu tiên                     [ 🌳 Money Tree ]    | |
| | Thêm 1.5%/năm lãi suất cho khoản...                         | |
| +-------------------------------------------------------------+ |
+-----------------------------------------------------------------+
|   [ ♦♦ ]         [ 💳 ]         [ ⇄ ]         [ 🎁 ]     [ 💡 ] |
|  Trang chủ    Tài khoản &    Chuyển tiền &  Techcornbank Tổng quan|
| (Active Red)     Thẻ          Thanh toán       OneU      tài sản|
+-----------------------------------------------------------------+
```

#### Detailed Dashboard Component Breakdown:
1. **Top Header & User Badge**:
   - **User Avatar & Tier Badge (Left)**: Circular red avatar (`#ED1C24`) with white monogram initials (`PB`), with a connected red capsule pill below reading `Inspire`.
   - **Utility Actions (Right)**: Search magnifying glass (`🔍`) and notification bell (`🔔`) with a scarlet red unread count badge (`9`).
2. **Hero Waveform Canvas**:
   - Dynamic soundwave bars in gradient tones of peach, coral, and orange (`#FFA07A` / `#FF7F50`).
   - Slogan lettering: Uppercase sans-serif `"BE INSPIRED"` accompanied by cursive handwritten `"why not!"`.
   - Floating marketing badge: `"Quét QR Chạm vận may"`.
3. **Floating Account Hero Card ("Số dư hiện có")**:
   - Pure white card (`#FFFFFF`) with $20\text{px}$ rounded corners and soft drop shadow.
   - Header row with `"Số dư hiện có"` and masked balance `********` with eyeball toggle button (`👁️⃥`).
   - Membership progression sub-card: `"Lên hạng Inspire Max"` detailing the 3-month 30M balance requirement for 25% reward points.
   - Solid black pill CTA button: `[Xem số dư]`.
4. **Quick Action Grid (5 Columns)**:
   - Row of 5 circular action icons with labels:
     1. `Gửi tiết kiệm` (Piggy bank icon)
     2. `Thanh toán hóa đơn` (Invoice/bill icon)
     3. `Quét mã QR` (QR scan frame icon)
     4. `Sinh lời tự động` (Compound interest / yield arrows icon)
     5. `Tính năng khác` (Right arrow circle icon)
5. **Promotional Banner Strip**:
   - Soft pink seasonal banner: `"Gửi lời yêu thương"` with floral 20/10 graphics and close `✕` control.
6. **"Dành cho bạn" Section**:
   - Card recommendation carousel: `"Khoản gửi đầu tiên"` with "+1.5%/năm lãi suất" and money tree illustration.
7. **Sticky 5-Tab Bottom Navigation Bar**:
   - **Trang chủ** (Active): Techcombank double-diamond red geometric emblem (`#ED1C24`), red indicator line, bold label.
   - **Tài khoản & Thẻ**: Card/wallet icon.
   - **Chuyển tiền & Thanh toán**: Double transfer arrows icon.
   - **Techcornbank OneU**: Gift box with smile loyalty icon.
   - **Tổng quan tài sản**: Circular lightbulb asset icon.

---

### 5.2. Recent Activity View (`TechcornbankHistoryView`)

Faithfully captures the authentic Techcombank Mobile transaction history screen (Image 1 reference):

```text
+-----------------------------------------------------------------+
| 18:58 📍                                                 5G 80% |
+-----------------------------------------------------------------+
| [ ← ]                                                           |
|                                                                 |
| Hoạt động gần đây                                               |
|                                                                 |
| ( 7 ngày trước )    [ 30 ngày trước ]    [ 60 ngày trước ]      |
|  (Active Solid)                                                 |
+-----------------------------------------------------------------+
| Hôm qua                                                         |
|                                                                 |
|   (↗)  LE THI KIM CUC                                   - 7,000 |
|        PHAM QUOC BAO chuyen tien                                |
|   -----------------------------------------------------------   |
|   (↗)  NGUYEN THI HUONG LAN                            - 80,000 |
|        PHAM QUOC BAO chuyen tien                                |
|   -----------------------------------------------------------   |
|                                                                 |
| Thứ Ba, 20 Thg 10, 2026                                         |
|                                                                 |
|   (↗)  VINA INVESTMENT DEVELOPMENT AND TECHNOLO...     - 50,000 |
|        Nap tien di dong tra truoc - So dien thoai...            |
|   -----------------------------------------------------------   |
|   (↙)  MAI NGOC VIET DUC                               + 45,000 |
|  (Grn) MAI NGOC VIET DUC chuyen tien                    (Green) |
|   -----------------------------------------------------------   |
|   (↗)  NGUYEN HUONG GIA HUONG GI                        - 35,000|
|        PHAM QUOC BAO chuyen tien        +---------------------+ |
|                                         |   Không tìm thấy    | |
|                                         |     giao dịch?      | |
|                                         +---------------------+ |
+-----------------------------------------------------------------+
```

#### Detailed Recent Activity Component Breakdown:
1. **Header & Title**:
   - Left-aligned navigation back button `[ ← ]`.
   - Prominent large bold title: **"Hoạt động gần đây"** ($24\text{px}$–$26\text{px}$, bold weight $700$/$800$).
2. **Time Period Quick-Filter Pills**:
   - Horizontal capsule selector placed immediately below the title:
     - `7 ngày trước`: Selected/active state with solid black fill (`#000000`) and pure white text (`#FFFFFF`).
     - `30 ngày trước`: Inactive state with white fill, subtle border (`#E5E7EB`), and dark text (`#000000`).
     - `60 ngày trước`: Inactive state with white fill, subtle border, and dark text.
3. **Date Section Headers**:
   - Clean, muted date division labels:
     - Relational format: `"Hôm qua"`
     - Standard calendar format: `"Thứ Ba, 20 Thg 10, 2026"` (`[Thứ], [DD] Thg [MM], [YYYY]`)
     - Styling: Regular $13\text{px}$–$14\text{px}$, muted steel gray `#8E8E93`.
4. **Transaction Row Architecture**:
   - **Outflow Debit Row**:
     - Glyph: Circle with arrow pointing up-right `(↗)` in dark charcoal `#111827`.
     - Counterparty: Uppercase bold text (e.g. `LE THI KIM CUC`, `NGUYEN THI HUONG LAN`).
     - Subtitle Memo: Secondary muted line `#6B7280` detailing the transfer memo or service (e.g. `PHAM QUOC BAO chuyen tien`).
     - Amount: Signed negative bold tabular text (e.g. `- 7,000`, `- 80,000`, `- 50,000`).
     - Divider: Subtle hairline border `#F3F4F6` between items.
   - **Inflow Credit Row**:
     - Glyph: Circle with arrow pointing down-left `(↙)` in vivid emerald green `#00A86B`.
     - Counterparty: Uppercase bold text (e.g. `MAI NGOC VIET DUC`).
     - Subtitle Memo: Secondary muted line `#6B7280` (e.g. `MAI NGOC VIET DUC chuyen tien`).
     - Amount: Signed positive bold tabular text in emerald green `#00A86B` (e.g. `+ 45,000`).
5. **Floating Support Tooltip (`Không tìm thấy giao dịch?`)**:
   - Pure white floating capsule card with rounded corners and soft drop shadow.
   - Centered 2-line blue text (`#007AFF`): *"Không tìm thấy giao dịch?"*.
   - Acts as an in-app trigger for search, filter expansion, or customer help.
6. **Dual-Layer Filtering & Forensic Interaction**:
   - **Period Layer**: Quick time pills (`7 ngày trước`, `30 ngày trước`, `60 ngày trước`) filter the visible transaction window.
   - **Directional Layer**: Combined with directional filters (`Tất cả`, `Tiền vào (+)`, `Tiền ra (-)`) to isolate specific financial flows.
   - **Evidence Interaction**: Tapping any transaction row opens the Digital Receipt Modal; holding the memo for **380 ms** triggers the detective evidence inspection overlay.

---

### 5.3. Detailed Digital Receipt Modal (`TechcornbankTransactionModal`)

```text
┌────────────────────────────────────────────────────────┐
│ [ Đóng ✕ ]            BIÊN LAI CHUYỂN TIỀN             │
├────────────────────────────────────────────────────────┤
│                    - 1.000 đ                           │
│             GIAO DỊCH THÀNH CÔNG                       │
├────────────────────────────────────────────────────────┤
│ Ngân hàng thụ hưởng:   DongViet Bank                   │
│ Tên người nhận:        NGUYEN THI BE MEO               │
│ Số tài khoản:          1029 **** 889                   │
│ Thời gian:             13/10/2026 23:46:12             │
│ Mã giao dịch:          FT262879912048                  │
├────────────────────────────────────────────────────────┤
│ Lời nhắn (Nội dung CK):                                │
│ "Em gian anh a sao khong nghe may goi mai khong duoc"  │
├────────────────────────────────────────────────────────┤
│            [ ⇪ Chia sẻ ]       [ ⬇ Lưu ảnh ]           │
└────────────────────────────────────────────────────────┘
```

* **Receipt Architecture**:
  - Full-screen drawer sheet with $24\text{px}$ top-corner radius.
  - Large signed amount display ($28\text{px}$ bold) with transaction status badge (`GIAO DỊCH THÀNH CÔNG`).
  - Beneficiary / Sender details: Bank, formatted account number, timestamp to the second, and unique FT transaction reference.
  - Full un-truncated `Lời nhắn` (memo content) wrapped in an italicized container.
  - **Forensic Hold**: Holding the memo text for **380 ms** opens the shared notebook evidence target (`CLUE-BANK-01`, `03`, `05`).

---

### 5.4. Savings Vaults & Sub-Accounts (`TechcornbankVaultView`)

Accessible from the **Sinh lời tự động** shortcut or **Tiết kiệm** / **Tổng quan tài sản** navigation:

```text
+-----------------------------------------------------------------+
| [ ← ]                 Hũ Tiết Kiệm & Quỹ Đen                    |
+-----------------------------------------------------------------+
| Tổng tích lũy                                                   |
| 80.000.000 đ                                                    |
+-----------------------------------------------------------------+
| HŨ ĐANG HOẠT ĐỘNG                                               |
|                                                                 |
| +-------------------------------------------------------------+ |
| | 💍 Tiet Kiem Mua Nhan Kim Cuong Cho Vo                      | |
| | Mục tiêu: 100.000.000 đ               Hiện có: 50.000.000 đ | |
| | Kỳ hạn: 12 tháng • Lãi suất: 5.8%/năm                       | |
| | Mở ngày: 15/04/2026 • Đáo hạn: 15/04/2027                   | |
| +-------------------------------------------------------------+ |
|                                                                 |
| +-------------------------------------------------------------+ |
| | 🚗 Quy Do Xang & Bao Duong Xe                               | |
| | Mục tiêu: 35.000.000 đ                Hiện có: 30.000.000 đ | |
| | Kỳ hạn: 6 tháng • Lãi suất: 4.5%/năm                        | |
| +-------------------------------------------------------------+ |
+-----------------------------------------------------------------+
```

---

### 5.5. Read-Only Account Profile View (`TechcornbankProfileView`)

```text
+-----------------------------------------------------------------+
| [ ← ]                       TÔI                                 |
+-----------------------------------------------------------------+
|  (PB)   Pham Quoc Bao                                           |
| Inspire STK: 1903 8888 6688                                     |
+-----------------------------------------------------------------+
| THÔNG TIN HỘI VIÊN                                              |
| Hạng hội viên hiện tại:           Inspire (Thành viên Triển vọng)|
| Điểm thưởng Techcornbank OneU:    1,250 điểm                    |
| Hạn mức chuyển khoản ngày:        500.000.000 đ                 |
+-----------------------------------------------------------------+
| BẢO MẬT & ĐĂNG NHẬP                                             |
| Khóa vân tay / Face ID:           Đang bật                      |
| Mã PIN giao dịch (Smart OTP):     Đã thiết lập                  |
+-----------------------------------------------------------------+
```

---

### 5.6. App & Vault PIN Keypad Gate (`TechcornbankPinGate`)

* Full-screen bank security challenge requiring a 4-digit PIN upon app launch or when accessing secured vaults on Level 2/3.
* Utilizes the shared game PIN pad with numeric keypad ($1$–$9$, $0$, backspace), strike accounting, and case-defined unlock challenge references (`CLUE-NOTE-01`).

---

## 6. Forensic Evidence & Clue Mapping Summary

| Clue ID | Component Target | Interaction | Narrative Reveal |
|---|---|---|---|
| `CLUE-BANK-01` | `TechcornbankHistoryView` • Micro-Transfers | Filter / Review feed | Midnight sequence of 1.000 VNĐ transfers with desperate apology memos. |
| `CLUE-BANK-02` | `TechcornbankHistoryView` • Allowance Inflow | Inflow filter (`+`) | Multi-million VNĐ inflows from wealthy contacts with affectionate memos (*"Thuong cho chuot con"*). |
| `CLUE-BANK-03` | `TechcornbankTransactionModal` • Receipt Drawer | Tap debit row | Categorized as luxury fine dining/hotel, debunking claimed casual street food. |
| `CLUE-BANK-04` | `TechcornbankVaultView` • Sub-Vault | Inspect vault list | Innocent surprise vault (*"Tiet Kiem Mua Nhan Kim Cuong Cho Vo"*). |
| `CLUE-BANK-05` | `TechcornbankTransactionModal` • Bill Split | Tap debit row | Memo reads *"Campuchia tien an toi 50/50"* with suspect female counterparty. |

---
type: App Design Specification
app_id: email
app_name: GeeMail
real_world_parody: Gmail (Google Workspace)
status: approved
description: "Branding, UI/UX visual design system, color tokens, typography, and wireframe layouts for GeeMail email application."
tags: [app-design, email, geemail, ui-ux, design-system, branding, google-workspace]
timestamp: "2026-10-13T19:10:00+07:00"
---

# GeeMail - App Design & UI/UX Specification

---

## 1. Brand Identity & Parody Theme

| Attribute | Specification |
|---|---|
| **App Name** | **GeeMail** (Satirical parody of *Google Gmail*) |
| **Slogan / Tagline** | *"Hộp thư vạn năng - Gửi nhận không dấu vết"* |
| **Real-World Parody** | Google Gmail mobile client (Material You / Google Workspace design). |
| **Trademark Defense** | Adopts a vibrant crimson-red (`#EA4335`) lettermark "G" envelope logo with rounded geometric contours distinct from Google's proprietary multi-color folded "M" ribbon. |
| **Visual Persona** | Clean, minimalist, search-centric email productivity suite with category pills, unread indicator chips, and interactive inbox rows. |

---

## 2. Visual Design System & Color Tokens

```
┌────────────────────────────────────────────────────────┐
│                  GEEMAIL COLOR PALETTE                 │
├────────────────────────────────────────────────────────┤
│ Primary Brand Red:    Crimson Red     #EA4335          │
│ Search Surface:       Soft Cloud Gray #F1F3F4          │
│ Unread Indicator:     Google Blue     #1A73E8          │
│ Important Star:       Amber Gold      #F4B400          │
│ Canvas Background:    Neutral White   #FFFFFF          │
│ Card Surface:         Light Gray      #F8F9FA          │
│ Text Primary:         Dark Charcoal   #202124          │
│ Text Secondary:       Cool Slate      #5F6368          │
│ Trash / Spam Alert:   Deep Coral      #D93025          │
└────────────────────────────────────────────────────────┘
```

* **Typography (Universal `text-ios-*` Tokens)**:
  * Sender Name (Unread): `text-ios-subheadline` ($15\text{px}$ Semibold / $600$, `#202124`).
  * Sender Name (Read): `text-ios-subheadline` ($15\text{px}$ Regular / $400$, `#202124`).
  * Subject Line: `text-ios-subheadline` ($15\text{px}$ Semibold / $600$).
  * Snippet Preview: `text-ios-footnote` ($13\text{px}$ Regular, `#52525B`, $\ge 4.5:1$ contrast).
  * Date / Timestamp: `text-ios-caption-1` ($12\text{px}$ Medium, `tabular-nums`, `#52525B`).
* **Ergonomics & Touch Targets**:
  * Rounded floating search pill height: $\ge 48\text{px}$.
  * Email list row item height: $\ge 72\text{px}$ with full-width tap target and `pb-24` bottom scroll clearance.
  * Category chips (`Hộp thư chính`, `Quảng cáo`, `Xã hội`, `Thư rác`): $36\text{px}$ visual pill inside $\ge 44\text{px}$ `.touch-target-min` hit area with horizontal scroll.
  * Floating Compose FAB: $56 \times 56\text{px}$ rounded pill button with `#EA4335` background.

---

## 3. UI Wireframes & Layout Architecture

### 3.1. Inbox Feed (`GeeMailInboxView`)
```
┌────────────────────────────────────────────────────────┐
│ 23:45             [ Dynamic Island ]    [Signal] [Batt]│
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ [<]   [Search] Tìm kiếm trong thư...      [Avatar] │ │
│ └────────────────────────────────────────────────────┘ │
│  [Hộp thư chính]  [Quảng cáo]  [Xã hội]  [Thư rác]     │
├────────────────────────────────────────────────────────┤
│ (Tất cả thư hộp thư đến)                               │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [TC] Techcornbank CSKH                       21:30 │ │
│ │      Mã xác thực khôi phục mật khẩu ví      [Star] │ │
│ │      Mã OTP khôi phục PIN bí mật của bạn là...     │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [VN] Vietnam Airlines E-Ticket             Hôm qua │ │
│ │      Xác nhận đặt vé khứ hồi Hà Nội - Đà Nẵng      │ │
│ │      Hành khách: Nguyễn Văn H. & Trần Thu T.       │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [HR] TechCorp HR Notification             10 thg 10│ │
│ │      Thông báo điều chỉnh phụ cấp công tác quý 4   │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│                                            ┌─────────┐ │
│                                            │[Pen]Soạn│ │
│                                            └─────────┘ │
├────────────────────────────────────────────────────────┤
│                 ═══════ [ - ] ═══════                  │
└────────────────────────────────────────────────────────┘
```

### 3.2. Email Reader Detail View (`GeeMailReaderView`)
```
┌────────────────────────────────────────────────────────┐
│ [< Hộp thư]                               [Trash][More]│
├────────────────────────────────────────────────────────┤
│ Xác nhận đặt vé khứ hồi Hà Nội - Đà Nẵng   [Hộp thư]  │
├────────────────────────────────────────────────────────┤
│ [VN] Vietnam Airlines E-Ticket                Hôm qua  │
│      tới: hoang.minh@techcorp.vn                       │
├────────────────────────────────────────────────────────┤
│ Kính gửi Quý khách NGUYEN VAN HOANG,                   │
│ Mã đặt chỗ (PNR): VNA88219                             │
│ Hành khách (StoryEvidenceTarget - Hold 380ms):         │
│ 1. NGUYEN VAN HOANG (Ghế 12A)                          │
│ 2. TRAN THU TRANG (Ghế 12B)                            │
│ Khởi hành: 15/10/2026 08:30 • Nội Bài (HAN) -> (DAD)   │
└────────────────────────────────────────────────────────┘
```
* **Zero-Spoiler Forensic Pinning (`380ms`)**: Static pin buttons are prohibited. Email body blocks, E-Ticket passenger manifests, and OTP recovery codes are wrapped in `StoryEvidenceTarget` (`380ms` hold or `Enter`/`Space` on keyboard focus) to open `UniversalEvidenceModal`.

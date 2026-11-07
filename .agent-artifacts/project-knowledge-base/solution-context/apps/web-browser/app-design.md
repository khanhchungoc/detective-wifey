---
type: App Design Specification
app_id: netsurf
app_name: NetSurf
real_world_parody: Safari / Google Chrome
status: approved
description: "Branding, UI/UX visual design system, color tokens, typography, and wireframe layouts for the NetSurf mobile browser app."
tags: [app-design, netsurf, browser, search, ui-ux, design-system, branding]
timestamp: "2026-10-13T14:35:00+07:00"
---

# NetSurf - App Design & UI/UX Specification

---

## 1. Brand Identity & Parody Theme

| Attribute | Specification |
|---|---|
| **App Name** | **NetSurf** (Parody of mobile *Safari* and *Google Chrome*) |
| **Slogan / Tagline** | *"Lướt web không dấu vết - Trừ khi vợ kiểm tra"* |
| **Real-World Parody** | Safari / Chrome |
| **Trademark Defense** | Uses a frosted minimalist slate and neutral light gray palette (`#F2F2F7`) with a stylized compass-and-keyhole icon. |
| **Visual Persona** | Sleek, modern mobile browser with tab cards, incognito mode styling, and simulated web reader views. |

---

## 2. Visual Design System & Color Tokens

```
┌────────────────────────────────────────────────────────┐
│                   NETSURF COLOR PALETTE                │
├────────────────────────────────────────────────────────┤
│ Background Canvas:    Frosted Slate   #F2F2F7          │
│ Card / Address Bar:   Pure White      #FFFFFF          │
│ Incognito Canvas:     Midnight Dark   #1C1C1E          │
│ Accent Link:          Royal Indigo    #3F51B5          │
│ Search Query Icon:    Accessible Slate  #52525B (≥4.5:1)│
│ Text Primary:         Jet Black         #111827        │
│ Incognito Text:       Ghost White       #F9FAFB        │
│ Incognito Subtext:    Light Slate       #94A3B8 (≥4.5:1)│
└────────────────────────────────────────────────────────┘
```

* **Typography (Universal `text-ios-*` Tokens)**:
  * Address Bar URL: `text-ios-footnote` ($13\text{px}$ Regular, `font-mono`).
  * Visited Page Title: `text-ios-subheadline` ($15\text{px}$ Semibold / $600$).
  * Search Query String: `text-ios-subheadline` ($15\text{px}$ Regular italic).
* **Ergonomics & Touch Targets**:
  * Bottom toolbar actions $\ge 48 \times 48\text{px}$ (`.touch-target-min`).
  * History list item touch target height $\ge 56\text{px}$ with `pb-24` scroll clearance.

---

## 3. UI Wireframes & Layout Architecture

### 3.1. Browsing History Screen (`NetSurfHistoryView`)
```
┌────────────────────────────────────────────────────────┐
│ [< Trang chủ]  [ [Lock] netsurf://history/today ] [↻]  │
├────────────────────────────────────────────────────────┤
│ [ Lịch sử tìm kiếm ]                [ Thẻ đang mở (3) ]│
├────────────────────────────────────────────────────────┤
│ HÔM NAY - 13/10/2026                                   │
├────────────────────────────────────────────────────────┤
│ [Search] "cách tắt định vị iphone mà vợ không biết"23:15│
│    netsurf.search/q=tat-dinh-vi-iphone                 │
├────────────────────────────────────────────────────────┤
│ [Search] "xoá lịch sử zalo có khôi phục được không"22:40│
│    netsurf.search/q=xoa-tin-nhan-zalo                  │
├────────────────────────────────────────────────────────┤
│ [Globe] Diễn đàn Trải Nghiệm Sugar Baby & Daddy   21:05│
│    diendan-tamsu.vn/topic-kinh-nghiem-chu-cap-sv       │
├────────────────────────────────────────────────────────┤
│ [News] VnExpress - Giá vàng SJC hôm nay tăng      14:30│
│    vnexpress.net/kinh-doanh/gia-vang-sjc               │
├────────────────────────────────────────────────────────┤
│ [ Back ]    [ Next ]    [ [Book] Lịch sử ] [Incognito] │
└────────────────────────────────────────────────────────┘
```

### 3.2. Incognito Tab Switcher & Web Reader Sub-View (`NetSurfTabSwitcherView` / `NetSurfReaderModal`)
```
┌────────────────────────────────────────────────────────┐
│ [ Đóng ✕ ]          THẺ ẨN DANH (INCOGNITO)  [Glasses] │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Glasses] Khách Sạn Tình Yêu Phố Cổ - Đặt Phòng VIP│ │
│ │ [Globe] lovehotel-phoco.vn/booking-confirm-12048   │ │
│ │                                                    │ │
│ │ Xác nhận đặt phòng: 15/10 - 2 Khách (Phòng Chủ Đề) │ │
│ │ Người đặt: Hoàng Minh • SĐT: 0912 *** 889          │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```
* **Zero-Spoiler Forensic Pinning (`380ms`)**: Static pin buttons are prohibited. Every search query row, visited article, and incognito tab card is wrapped in `StoryEvidenceTarget` (`380ms` hold or `Enter`/`Space` on keyboard focus) to open `UniversalEvidenceModal`.

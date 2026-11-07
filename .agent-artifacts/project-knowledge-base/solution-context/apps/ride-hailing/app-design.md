---
type: App Design Specification
app_id: grap
app_name: Grap
real_world_parody: Grab / Be
status: approved
description: "Branding, UI/UX visual design system, color tokens, typography, and wireframe layouts for the Grap ride-hailing & food delivery app."
tags: [app-design, grap, transportation, food-delivery, ui-ux, design-system, branding]
timestamp: "2026-10-13T14:35:00+07:00"
---

# Grap - App Design & UI/UX Specification

---

## 1. Brand Identity & Parody Theme

| Attribute | Specification |
|---|---|
| **App Name** | **Grap** (Parody of *Grab* and *Be*) |
| **Slogan / Tagline** | *"Đưa đón tận tình - Lộ trình giấu kín"* |
| **Real-World Parody** | Grab / Be |
| **Trademark Defense** | Uses a distinct forest mint green (`#00B14F`) combined with deep charcoal slate (`#1F2937`) rather than Grab's neon green. Features a custom steering-wheel pin icon. |
| **Visual Persona** | Real-time mobility and food delivery interface with pickup/drop-off pins, vehicle badges, and delivery notes. |

---

## 2. Visual Design System & Color Tokens

```
┌────────────────────────────────────────────────────────┐
│                    GRAP COLOR PALETTE                  │
├────────────────────────────────────────────────────────┤
│ Primary Brand:        Forest Mint Green #00B14F        │
│ Dark Accent:          Slate Charcoal    #1F2937        │
│ Card Surface:         Pure White        #FFFFFF        │
│ Background Canvas:    Light Platinum    #F3F4F6        │
│ Route Origin Pin:     Leaf Green        #10B981        │
│ Route Dest Pin:       Crimson Red       #EF4444        │
│ Food Tag Pill:        Soft Orange       #FFEDD5        │
│ Text Primary:         Slate Charcoal    #111827        │
│ Text Secondary:       Accessible Slate  #52525B (≥4.5:1)│
└────────────────────────────────────────────────────────┘
```

* **Typography (Universal `text-ios-*` Tokens)**:
  * Vehicle / Service Title: `text-ios-subheadline` ($15\text{px}$ Semibold / $600$, `#111827`).
  * Address & Route: `text-ios-subheadline` ($15\text{px}$ Regular / $400$, `#1F2937`).
  * Timestamps & Metadata: `text-ios-footnote` ($13\text{px}$ Regular / $400$, `tabular-nums`, `#52525B`).
  * Fares: `text-ios-callout` ($16\text{px}$ Semibold / $600$, `tabular-nums`, `#00B14F`).
* **Ergonomics & Touch Targets**:
  * Service category tabs (`Di chuyển`, `Đồ ăn`, `Giao hàng`) $\ge 48\text{px}$ height (`.touch-target-min`).
  * Activity cards expand on full-card touch ($\ge 72\text{px}$ height).
  * Scrollable list includes `pb-24` bottom clearance for sticky HUDs.

---

## 3. UI Wireframes & Layout Architecture

### 3.1. Activity Feed Screen (`GrapActivityListView`)
```
┌────────────────────────────────────────────────────────┐
│ [< Trang chủ]           Hoạt động Grap     [Headset]   │
├────────────────────────────────────────────────────────┤
│ [ Di chuyển (3) ]       [ Đồ ăn (2) ]       [ Giao hàng ]│
├────────────────────────────────────────────────────────┤
│ [Car] GrapCar • ĐÃ HOÀN THÀNH                    23:45 │
│    [Origin] Điểm đón: Tòa nhà Keangnam Landmark 72     │
│    [Dest]   Điểm đến: Khách sạn Sao Mai - 45 Nguyễn Khang│
│    Giá cước: 85.000 đ                                  │
├────────────────────────────────────────────────────────┤
│ [Bike] GrapBike • ĐÃ HOÀN THÀNH                  08:15 │
│    [Origin] Điểm đón: Chung cư Imperia Garden          │
│    [Dest]   Điểm đến: Cty BĐS Hưng Vượng - Cầu Giấy    │
│    Giá cước: 32.000 đ                                  │
├────────────────────────────────────────────────────────┤
│ [Food] GrapFood • ĐÃ HOÀN THÀNH                  15:20 │
│    Trà sữa MayCha - 2 ly Trà sữa trân châu đường đen   │
│    [Pin] Giao đến: Tòa nhà Techcombank, 191 Bà Triệu   │
│    [Note] "Giao tận tay bạn Mai lễ tân giúp mình nhé"  │
└────────────────────────────────────────────────────────┘
```

### 3.2. Activity Detail Modal (`GrapRideDetailModal` / `GrapFoodDetailModal`)
```
┌────────────────────────────────────────────────────────┐
│ [ Đóng ✕ ]            CHI TIẾT CHUYẾN ĐI               │
├────────────────────────────────────────────────────────┤
│ Trạng thái:            Đã hoàn thành                   │
│ Thời gian:             13/10/2026 23:45                │
│ Loại dịch vụ:          GrapCar 4 chỗ                   │
│ Tài xế:                Nguyễn Văn Tài • 29A-881.20     │
├────────────────────────────────────────────────────────┤
│ LỘ TRÌNH (StoryEvidenceTarget - Hold 380ms):           │
│ [Origin] Điểm đón: Tòa nhà Keangnam Landmark 72        │
│ [Dest]   Điểm đến: Khách sạn Sao Mai - 45 Nguyễn Khang │
│ Khoảng cách: 4.8 km • Cước phí: 85.000 đ (Ví GrapPay)  │
├────────────────────────────────────────────────────────┤
│ GHI CHÚ CHO TÀI XẾ (StoryEvidenceTarget - Hold 380ms): │
│ "Đỗ ở cổng phụ khu biệt thự nghỉ dưỡng nhé bác tài"   │
└────────────────────────────────────────────────────────┘
```

### 3.3. Empty State & Forensic Evidence Mapping
* **Empty Category State**: When a tab (`Giao hàng`) has 0 records, renders a centered `IoCarOutline` vector illustration with `text-ios-subheadline text-[#52525B]` (*"Chưa có hoạt động nào trong danh mục này"*).
* **Zero-Spoiler Forensic Pinning (`380ms`)**: Static pin buttons are prohibited. Activity rows, route destination blocks, and food delivery notes are wrapped in `StoryEvidenceTarget` (`380ms` hold or `Enter`/`Space` on keyboard focus) to trigger `UniversalEvidenceModal`.

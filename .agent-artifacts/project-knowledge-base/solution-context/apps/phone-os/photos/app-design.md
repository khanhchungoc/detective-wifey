---
type: App Design Specification
app_id: photos
app_name: Photos
real_world_parody: iOS Photos (iOS 26/27 Parody Edition)
status: approved
description: "Branding, UI/UX visual design system, color tokens, typography, and wireframe layouts for the Photos gallery & media forensics app conforming to iOS 26/27 unified single-view standards."
tags: [app-design, photos, gallery, media, visual-forensics, ui-ux, design-system, branding, ios27]
timestamp: "2026-10-14T12:55:00+07:00"
---

# Photos - App Design & UI/UX Specification

> **Parent Design Master**: [../app-design.md](../app-design.md)  
> **Functional Specification**: [features.md](features.md)  
> **Standard**: iOS 26/27 Unified Single-View Photostream & Forensic Collections

---

## 1. Brand Identity & Parody Theme

| Attribute | Specification |
|---|---|
| **App Name** | **Photos** (Parody of *iOS Photos*) |
| **Slogan / Tagline** | *"Kỷ niệm đáng nhớ - Góc khuất đáng ngờ"* |
| **Real-World Parody** | Native iOS Photos (iOS 26/27 Unified Architecture) |
| **Trademark Defense** | Uses an immersive obsidian dark theme (`#000000`) with clean borderless photo tiles and a custom multi-petal camera aperture icon from Ionicons (`images-outline`). |
| **Visual Persona** | High-contrast visual media gallery with full-screen pinch-to-zoom lightbox, smart detective collections, and AI Clean Up forensic hotspot inspection. |

---

## 2. Visual Design System & Color Tokens

```
┌────────────────────────────────────────────────────────┐
│                   PHOTOS COLOR PALETTE                 │
├────────────────────────────────────────────────────────┤
│ Background Canvas:    Obsidian Black  #000000          │
│ Tile Card:            Charcoal Dark   #1C1C1E          │
│ Collections Card:     Slate Dark      #2C2C2E          │
│ Highlight Accent:     Electric Blue   #2979FF          │
│ Lock Badge:           Amber Yellow    #FFC107          │
│ Text Primary:         Pure White      #FFFFFF          │
│ Text Metadata:        Accessible Slate#94A3B8 (≥4.5:1) │
│ Forensic Magnifier:   Cyan Ring       #00E5FF          │
└────────────────────────────────────────────────────────┘
```

* **Typography & Dynamic Scale (Universal `text-ios-*` Tokens)**:
  * Date Section Header: `text-ios-title-3` ($20\text{px}$ Semibold / $600$).
  * Collections Title: `text-ios-callout` ($16\text{px}$ Semibold / $600$).
  * Metadata / Geotag / EXIF: `text-ios-footnote` ($13\text{px}$ Regular / $400$, `tabular-nums`, `#94A3B8`).
* **Ergonomics & Touch Targets**:
  * Filter pills ($32\text{px}$ visual pill height wrapped in `.touch-target-min` $\ge 44 \times 44\text{px}$ hit area, $16\text{px}$ pill radius).
  * Double-tap to zoom or pinch-to-zoom on full-screen images (plus `+`/`-` zoom buttons for keyboard/single-pointer accessibility).
  * Info sheet drawer toggle button $\ge 44 \times 44\text{px}$.

---

## 3. UI Wireframes & Layout Architecture

### 3.1. Unified Single-Scroll Gallery Screen (`PhotoGridView`)

In accordance with iOS 26/27 design architecture, bottom navigation tabs are eliminated. The entire library is presented in a **unified single vertical scroll**, seamlessly moving from the upper chronologically organized photo grid into categorized smart detective collections below:

```
┌────────────────────────────────────────────────────────┐
│ [< Trang chủ]                 Ảnh               [ 🔍 ] │
├────────────────────────────────────────────────────────┤
│ [ Năm ]        [ Tháng ]        [ Tất cả ảnh (Active) ] │
├────────────────────────────────────────────────────────┤
│ HÔM NAY - 13/10/2026                                   │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐│
│ │ 🍷 Bữa tối│ │ 🚗 Xe ô tô│ │ 🐱 Mèo con│ │ 🍜 Bát phở││
│ │ (Phản chiếu)│ │(Túi xách nữ)│ │           │ │           ││
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘│
├────────────────────────────────────────────────────────┤
│ HÔM QUA - 12/10/2026                                   │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐│
│ │ 🏢 Công ty│ │ ☕ Cafe   │ │ 📑 Hợp đồng│ │ 🅿️ Vé xe  ││
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘│
├────────────────────────────────────────────────────────┤
│ ▼ BỘ SƯU TẬP THÔNG MINH (SMART COLLECTIONS)            │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [People] Gương mặt & Đối tượng           (4 người) │ │
│ │ • "Em Trang Láng" (Nhận diện 12 ảnh cùng quán cafe)│ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [Pin] Chuyến đi đáng ngờ                 (2 địa điểm)│
│ │ • Thảo Điền (Quận 2) • Hồ Tràm (Vũng Tàu)          │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [Calendar] Ngày kỷ niệm & Sự kiện       (Xem thêm >)│
│ ├────────────────────────────────────────────────────┤ │
│ │ [Lock] MỤC BỊ ẨN (2 ẢNH)                [ Khóa PIN ]│ │
│ │ Chạm để mở khoá bằng mã PIN 4 số                     │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ ══════════════════════ [ - ] ═════════════════════════ │
└────────────────────────────────────────────────────────┘
```

* **Hidden Vault Authentication Flow**:
  * Tapping `[Lock] MỤC BỊ ẨN` overlays the system [Shared PIN Lockpad](../pin-lockpad.md).
  * Successful 4-digit PIN verification expands the locked sub-grid displaying compromising evidence photos.

---

### 3.2. Forensic Lightbox Screen (`PhotoLightboxView`)

Full-screen media view equipped with iOS 26/27 inspection tools and the **AI Clean Up / Spatial Reframing Lens**:

```
┌────────────────────────────────────────────────────────┐
│ [ Đóng ✕ ]            13/10/2026 21:30          [ ℹ️ ] │
├────────────────────────────────────────────────────────┤
│                                                        │
│             ┌─────────────────────────┐                │
│             │  [ 🔍 KÍNH LÚP FORENSIC ]│                │
│             │                         │                │
│             │   🍷 Ly rượu vang       │                │
│             │      (Bóng bàn tay phụ  │                │
│             │       nữ làm móng đỏ)   │                │
│             │                         │                │
│             └─────────────────────────┘                │
│                                                        │
│       [ Wand ] AI Clean Up & Spatial Reframing         │
├────────────────────────────────────────────────────────┤
│ THÔNG TIN ẢNH (EXIF METADATA DRAWER):                  │
│ [Pin] Địa điểm: Nhà hàng The Deck Saigon - Thảo Điền   │
│ [Camera] Camera: Flagship Pro Max • Tiêu cự 24mm       │
│ [Time] Thời gian chụp: 21:30:14 GMT+7                  │
├────────────────────────────────────────────────────────┤
│ ══════════════════════ [ - ] ═════════════════════════ │
└────────────────────────────────────────────────────────┘
```

* **Interactive Touch Targets & Zero-Spoiler Pinning (`380ms`)**:
  * `[ Info ]`: Toggles slide-up EXIF metadata drawer showing GPS geotag and exact capture timestamp (conflicts with husband's claimed overtime schedule).
  * `[ Wand ] AI Clean Up`: Highlights background reflections and strips obscuring glare to reveal forensic suspect details.
  * **Zero-Spoiler Pinning**: Static pin buttons are prohibited. Long-pressing (`380ms` or `Enter`/`Space` on keyboard focus) the photo canvas or EXIF metadata row (`StoryEvidenceTarget`) opens `UniversalEvidenceModal`.

---

## 4. Traceability & Associated Deliverables

* **Parent OS Master**: [../app-design.md](../app-design.md)
* **Functional Specification**: [features.md](features.md)
* **Shared PIN Lockpad**: [../pin-lockpad.md](../pin-lockpad.md)
* **Universal Design System**: [../../design-system/design.md](../../design-system/design.md)

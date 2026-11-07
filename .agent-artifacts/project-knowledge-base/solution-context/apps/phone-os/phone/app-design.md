---
type: App Design Specification
app_id: phone
app_name: Phone
real_world_parody: iOS Phone (iOS 26/27 Parody Edition)
status: approved
description: "Branding, UI/UX visual design system, color tokens, typography, and wireframe layouts for the native Phone dialer, call history, and contact directory."
tags: [app-design, phone, dialer, recents, contacts, ui-ux, design-system, branding, ios27]
timestamp: "2026-10-14T13:00:00+07:00"
---

# Phone - App Design & UI/UX Specification

> **Parent Design Master**: [../app-design.md](../app-design.md)  
> **Functional Specification**: [features.md](features.md)  
> **Standard**: iOS 26/27 Phone Dialer, Recents & Contact Directory

---

## 1. Brand Identity & Parody Theme

| Attribute | Specification |
|---|---|
| **App Name** | **Phone** (Native iOS Phone Parody) |
| **Slogan / Tagline** | *"Gọi một phút - Nghi ngờ một đời"* |
| **Real-World Parody** | Native iOS Phone (iOS 26/27 Architecture) |
| **Trademark Defense** | Minimalist system dialer utility utilizing classic Apple call green (`#34C759`) and signal alert red (`#FF3B30`), with Ionicons `call-outline` system vector icon. |
| **Visual Persona** | High-contrast call history with duration badges, full contact directory, and interactive suspect contact cards. |

---

## 2. Visual Design System & Color Tokens

```
┌────────────────────────────────────────────────────────┐
│                    PHONE COLOR PALETTE                 │
├────────────────────────────────────────────────────────┤
│ Background Canvas:    Pure White      #FFFFFF          │
│ Outgoing Call Icon:   Apple Green     #34C759          │
│ Missed Call Icon:     Signal Red      #FF3B30          │
│ System Accent Blue:   iOS Blue        #007AFF          │
│ Contact Avatar Surface: Soft Slate    #E5E5EA          │
│ Divider Line:         Separator Gray  #C6C6C8          │
│ Text Primary:         Jet Black       #000000          │
│ Text Subtitle:        Accessible Slate#52525B (≥4.5:1) │
└────────────────────────────────────────────────────────┘
```

* **Typography & Layout Constraints (Universal `text-ios-*` Tokens)**:
  * Contact Name: `text-ios-headline` ($17\text{px}$ Semibold / $600$).
  * Call Subtitle & Duration: `text-ios-footnote` ($13\text{px}$ Regular / $400$, `tabular-nums`, `#52525B`).
  * Tab Bar Item: `text-ios-caption-2` ($11\text{px}$ Semibold / $600$) with $24\text{px}$ Ionicons vector glyph.
  * Minimum Touch Target: Call rows $\ge 52\text{px}$ height; info buttons $\ge 44 \times 44\text{px}$ (`.touch-target-min`); scrollable views include `pb-24` clearance for sticky bars/HUDs.

---

## 3. UI Wireframes & Layout Architecture

### 3.1. Recents Screen (`PhoneRecentsView`)

Native call history showing chronologically logged incoming, outgoing, and missed calls with exact duration indicators:

```
┌────────────────────────────────────────────────────────┐
│ [< Trang chủ]                 Điện thoại        [ Sửa ]│
├────────────────────────────────────────────────────────┤
│           [ Tất cả (Active) ]     [ Gọi nhỡ ]          │
├────────────────────────────────────────────────────────┤
│ [Call:Out] Tổng Đài Viettel                      23:45 │
│    📞 Cuộc gọi đi • ⏱️ 1 phút 12 giây            [ ℹ️ ] │
├────────────────────────────────────────────────────────┤
│ [Call:Out] Đồng nghiệp Nam                       23:10 │
│    📞 Cuộc gọi đi • ⏱️ 1 phút 45 giây            [ ℹ️ ] │
├────────────────────────────────────────────────────────┤
│ [Call:Miss] Số lạ (+84 988 123 456)             22:15 │
│    🔴 Cuộc gọi nhỡ                               [ ℹ️ ] │
├────────────────────────────────────────────────────────┤
│ [Call:In]  Mẹ Đẻ                                18:05 │
│    📞 Cuộc gọi đến • ⏱️ 5 phút 20 giây           [ ℹ️ ] │
├────────────────────────────────────────────────────────┤
│ [Call:Out] Grap Driver                          17:30 │
│    📞 Cuộc gọi đi • ⏱️ 32 giây                   [ ℹ️ ] │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Star]      [Clock]        [Book]         [Grid]   │ │
│ │ Yêu thích  Gần đây (●)    Danh bạ       Bàn phím   │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ ══════════════════════ [ - ] ═════════════════════════ │
└────────────────────────────────────────────────────────┘
```

* **Detective Investigation Notes**:
  * Outgoing midnight call to *"Tổng Đài Viettel"* at 23:45 lasting only 1 minute is a disguise for the husband's quick check-in call with a suspect.
  * Tapping `[ ℹ️ ]` opens the Contact Detail Modal.

---

### 3.2. Contact Detail Inspector (`PhoneContactDetailModal`)

Slide-up modal inspecting profile details, phone numbers, and hidden memo fields:
* Contact portraits use the same persona-specific avatar as the matching SMS and Zola identity; service contacts use an appropriate business icon.

```
┌────────────────────────────────────────────────────────┐
│ [ Đóng ✕ ]            CHI TIẾT LIÊN HỆ         [ Sửa ] │
├────────────────────────────────────────────────────────┤
│                                                        │
│                        [ 👤 BC ]                       │
│                      Bác Sĩ Cương                      │
│                       (Nhãn khoa)                      │
│                                                        │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│   │ [Msg]    │  │ [Call]   │  │ [Video]  │  │ [Mail] │ │
│   │ Nhắn tin │  │ Gọi điện │  │ FaceTime │  │ Gửi mail││
│   └──────────┘  └──────────┘  └──────────┘  └────────┘ │
├────────────────────────────────────────────────────────┤
│ SỐ ĐIỆN THOẠI:                                         │
│ Di động:        0912 888 999                           │
│ Công việc:      0988 123 456                           │
├────────────────────────────────────────────────────────┤
│ GHI CHÚ BÍ MẬT (StoryEvidenceTarget - Hold 380ms):     │
│ "Chung cư Sunshine City - Tòa S2 P1408 (Mã cửa: 1408)" │
├────────────────────────────────────────────────────────┤
│ ══════════════════════ [ - ] ═════════════════════════ │
└────────────────────────────────────────────────────────┘
```
* **Zero-Spoiler Pinning Rule**: Static pin buttons are prohibited. Long-pressing (`380ms` or `Enter`/`Space` on keyboard focus) any call log row or contact memo (`StoryEvidenceTarget`) opens `UniversalEvidenceModal`.

---

### 3.3. Keypad & T9 Dialer Screen (`PhoneKeypadView`)

Standard iOS numeric telephone dialer with alphabetic letter pairings:

```
┌────────────────────────────────────────────────────────┐
│ [< Trang chủ]                                   [ 🔍 ] │
├────────────────────────────────────────────────────────┤
│                                                        │
│                      0988 123 456                      │
│                                                        │
│           ┌───────┐     ┌───────┐     ┌───────┐        │
│           │   1   │     │   2   │     │   3   │        │
│           │       │     │  ABC  │     │  DEF  │        │
│           └───────┘     └───────┘     └───────┘        │
│           ┌───────┐     ┌───────┐     ┌───────┐        │
│           │   4   │     │   5   │     │   6   │        │
│           │  GHI  │     │  JKL  │     │  MNO  │        │
│           └───────┘     └───────┘     └───────┘        │
│           ┌───────┐     ┌───────┐     ┌───────┐        │
│           │   7   │     │   8   │     │   9   │        │
│           │ PQRS  │     │  TUV  │     │ WXYZ  │        │
│           └───────┘     └───────┘     └───────┘        │
│           ┌───────┐     ┌───────┐     ┌───────┐        │
│           │   *   │     │   0   │     │   #   │        │
│           │       │     │   +   │     │       │        │
│           └───────┘     └───────┘     └───────┘        │
│                         ┌───────┐                      │
│                         │ [Call]│                      │
│                         └───────┘                      │
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Star]      [Clock]        [Book]         [Grid]   │ │
│ │ Yêu thích   Gần đây       Danh bạ       Bàn phím(●)│ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ ══════════════════════ [ - ] ═════════════════════════ │
└────────────────────────────────────────────────────────┘
```

---

## 4. Traceability & Associated Deliverables

* **Parent OS Master**: [../app-design.md](../app-design.md)
* **Functional Specification**: [features.md](features.md)
* **Sister App (Messages)**: [../messages/app-design.md](../messages/app-design.md)
* **Universal Design System**: [../../design-system/design.md](../../design-system/design.md)

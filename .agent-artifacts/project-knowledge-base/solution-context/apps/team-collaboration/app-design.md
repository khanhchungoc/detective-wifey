---
type: App Design Specification
app_id: team-collaboration
app_name: Tim
real_world_parody: Microsoft Teams
status: approved
description: "Branding, UI/UX visual design system, color tokens, typography, and wireframe layouts for Tim team collaboration application."
tags: [app-design, team-collaboration, tim, teams, microsoft-teams, ui-ux, design-system, branding]
timestamp: "2026-10-13T19:10:00+07:00"
---

# Tim - App Design & UI/UX Specification

---

## 1. Brand Identity & Parody Theme

| Attribute | Specification |
|---|---|
| **App Name** | **Tim** (Satirical parody of *Microsoft Teams*, playing on Vietnamese word *Tim* = Heart / Team) |
| **Slogan / Tagline** | *"Cùng nhau làm việc - OT tới sáng"* |
| **Real-World Parody** | Microsoft Teams mobile application (Enterprise messaging, channels, status updates). |
| **Trademark Defense** | Uses a signature Teams purple/indigo (`#464EB8`) paired with lavender accents. Icon features two overlapping corporate avatar silhouettes inside a rounded purple square with a lettermark "T". |
| **Visual Persona** | Corporate enterprise communication tool with presence status dots (Available, Busy, Away), status message quotes, and department channels. |

---

## 2. Visual Design System & Color Tokens

```
┌────────────────────────────────────────────────────────┐
│                   TIM COLOR PALETTE                    │
├────────────────────────────────────────────────────────┤
│ Primary Brand Purple: Microsoft Teams #464EB8          │
│ Lavender Accent:      Soft Lavender   #6264A7          │
│ Status Active:        Presence Green  #92C353          │
│ Status Busy / DND:    Presence Red    #C4314B          │
│ Status Away:          Presence Amber  #FFAA44          │
│ Canvas Background:    Light Gray      #F5F5F5          │
│ Card Surface:         Pure White      #FFFFFF          │
│ Text Primary:         Dark Slate      #252424          │
│ Text Secondary:       Medium Gray     #616161          │
│ Banner Notification:  Soft Purple Tint#EBEBF5          │
└────────────────────────────────────────────────────────┘
```

* **Typography (Universal `text-ios-*` Tokens)**:
  * Channel / Contact Name: `text-ios-subheadline` ($15\text{px}$ Semibold / $600$, `#252424`).
  * Status Message Quote: `text-ios-footnote` ($13\text{px}$ Regular italic, `#52525B`, $\ge 4.5:1$ contrast).
  * Message Bubble: `text-ios-subheadline` ($15\text{px}$ Regular, `#252424`).
  * Channel Header: `text-ios-callout` ($16\text{px}$ Semibold / $600$).
* **Ergonomics & Touch Targets**:
  * Top navigation header & status chip: $\ge 48\text{px}$ height.
  * Channel item / Chat row height: $\ge 64\text{px}$ with full-width touch area and `pb-24` bottom scroll clearance.
  * Presence indicator badge: $12 \times 12\text{px}$ circular chip with semantic shape/icon (`Available`, `DND`, `Offline`) pinned to bottom-right of avatar (never relying on color alone).
  * Bottom navigation tabs (`Hoạt động`, `Trò chuyện`, `Nhóm`, `Lịch`): $\ge 44\text{px}$ height (`.touch-target-min`).

---

## 3. UI Wireframes & Layout Architecture

### 3.1. Chat & Presence List (`TimChatListView`)
```
┌────────────────────────────────────────────────────────┐
│ 23:45             [ Dynamic Island ]    [Signal] [Batt]│
├────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │ [<] [Avatar: DND] Hoàng Minh Tuấn    [Search][Edit]│ │
│ │  Status: "Đang họp kín dự án đặc biệt (DND)"       │ │
│ └────────────────────────────────────────────────────┘ │
│  [Trò chuyện]       [Nhóm]       [Lịch]       [Cuộc gọi]│
├────────────────────────────────────────────────────────┤
│ (Danh sách trò chuyện)                                 │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [IT] IT Support Helpdesk                     14:20 │ │
│ │      "Nhắc nhở: Mã PIN phòng IT mặc định là 4920"  │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [Avatar: Online] Lan Anh (Marketing)         23:10 │ │
│ │      "Anh xong việc chưa? Qua quán pub cũ nhé..."  │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ [Avatar: Offline] Sếp Hoàng (Director)       18:05 │ │
│ │      "Báo cáo tuần gửi trước sáng mai nhé Tuấn"    │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│                 ═══════ [ - ] ═══════                  │
└────────────────────────────────────────────────────────┘
```

### 3.2. Direct Message & Calendar Shift Sub-View (`TimThreadView` / `TimCalendarView`)
```
┌────────────────────────────────────────────────────────┐
│ [< Trò chuyện]    Lan Anh (Marketing) • Đang hoạt động │
├────────────────────────────────────────────────────────┤
│ HÔM NAY - 13/10/2026                                   │
│                                                        │
│ Lan Anh (18:00): "Tối nay team mình nghỉ sớm, anh nhớ  │
│ báo chị nhà là công ty bắt trực ca đêm nhé!"           │
│                                                        │
│ Hoàng Minh Tuấn (18:02): "Ok em, anh bật status DND    │
│ trên Tim rồi, 20h anh qua đón."                        │
└────────────────────────────────────────────────────────┘
```
* **Zero-Spoiler Forensic Pinning (`380ms`)**: Static pin buttons are prohibited. Status banners, IT PIN reminders, chat messages, and calendar shift blocks are wrapped in `StoryEvidenceTarget` (`380ms` hold or `Enter`/`Space` on keyboard focus) to open `UniversalEvidenceModal`.

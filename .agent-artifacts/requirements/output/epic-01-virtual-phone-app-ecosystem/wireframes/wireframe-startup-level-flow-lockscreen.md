---
type: Wireframe Specification
epic: "Epic 01: Virtual Phone Shell & MVP Parody App Suite (Release 1)"
status: signed-off
stories: [US-035, US-036, US-037, US-038]
description: "Canonical ASCII wireframe covering Detective App Startup, Husband Carousel & Level Selector Hub, Level Context & Persona Briefing with Interactive Intro Dialogue, iOS 27 Phone Shell Lockscreen with Hybrid Unlock, and Notification Dropdown mid-case shortcuts."
tags: [wireframe, ascii, startup, level-selector, level-context, persona, lockscreen, notification-dropdown]
timestamp: "2026-11-27"
---

# Startup, Level Selector Hub, Case Context & iOS 27 Lockscreen - ASCII Wireframe (Screen SSOT)

## Overview

- **User Role / Persona**: Vietnamese Gen Z & Gen Alpha Player (Age 13+), playing as the Detective Wife.
- **Primary Goal**: Move smoothly from app launch through husband/level selection, comedic narrative context & persona briefing, and unlocking the husband's iOS 27 phone to start investigating, with quick mid-case return via the phone's Notification Dropdown.
- **Context / Use Case**: Entry flow for first-time and returning players, plus mid-case level switching and case-context recall.
- **Platform**: Mobile-first portrait web viewport (375px-430px base width; centered phone bezel on desktop).
- **Parent Design References**: [Game App Design System](../../../project-knowledge-base/solution-context/design-system/game-design-system.md) (Screens 1-3: Startup, Level Selector Hub, Case Context & Intro) and [Phone OS Master Design](../../../project-knowledge-base/solution-context/apps/phone-os/app-design.md) (Screens 4-5: iOS 27 Lockscreen & Notification Dropdown).

## Screen Inventory

1. **Screen 1 (`US-035`)**: Detective App Startup Screen (Preloader & Tap-to-Start Gate)
2. **Screen 2 (`US-036`)**: Husband Carousel & Level Selector Hub
3. **Screen 3 (`US-037`)**: Level Context, Husband Persona & Interactive Intro Briefing (2 sub-states: Intro Dialogue & Case Briefing Card)
4. **Screen 4 (`US-038`)**: iOS 27 Phone Shell Lockscreen (2 sub-states: Lockscreen View & Optional Passcode Pad for Level 2-3)
5. **Screen 5 (`US-036` / `US-037` / `US-038`)**: Phone Shell Notification Dropdown & Level-Switch Confirmation Modal

---

## Screen 1: Detective App Startup (`US-035`)

### Layout Hierarchy

```text
+---------------------------------------------------+
|                                                   |
|                                                   |
|               [Game Emblem Graphic]               |
|                                                   |
|                   VO BAT GIAN                     |
|                BAT DUOC TIEU TAM                  |
|                                                   |
|      "Chong vua ngu say... Da den luc dieu tra!"  |
|                                                   |
|                                                   |
|   -- Loading State (0% -> 99%) ----------------   |
|   [================--------]  68%                 |
|   Dang tai ho so vu an...                         |
|                                                   |
|   -- Ready State (100%) -----------------------   |
|   +-------------------------------------------+   |
|   |            CHAM DE BAT DAU                |   |
|   +-------------------------------------------+   |
|         (Cham man hinh de bat am thanh)           |
|                                                   |
|                                      v1.0 MVP     |
+---------------------------------------------------+
```

### Sections & Actions
- **Header**: None (fullscreen immersive boot canvas).
- **Primary content**: Game emblem, title (`"VỢ BẮT GIAN - BẮT ĐƯỢC TIỂU TAM"`), atmospheric subtitle.
- **Secondary content**: Version tag at bottom corner; loading progress bar transitioning into the tap-to-start prompt at 100%.
- **Actions**: Single primary action (`CHAM DE BAT DAU`) anywhere on the interactive button/screen once loading reaches 100%.
- **Navigation model**: Tapping unlocks Web Audio and transitions directly to **Screen 2 (Level Selector Hub)**.

---

## Screen 2: Husband Carousel & Level Selector Hub (`US-036`)

### Layout Hierarchy

```text
+---------------------------------------------------+
|  HO SO DIEU TRA                 [Sound On/Off]    |
+---------------------------------------------------+
|  <-- Swipe left / right to switch husband -->     |
|                                                   |
|  [ < ]   +-----------------------------+   [ > ]  |
|          |     [Husband Portrait]      |          |
|          |                             |          |
|          |  CHONG HOANG (29 tuoi)      |          |
|          |  Senior Dev - Technosoft    |          |
|          |  "Anh tang ca fix bug..."   |          |
|          +-----------------------------+          |
|                  ( * )   ( o )                    |
+---------------------------------------------------+
|  CHON MAN CHOI                                    |
|                                                   |
|  +---------------------------------------------+  |
|  | [Badge: DE XUAT]  MAN 0: TAP DIEU TRA       |  |
|  | Trang thai: Chua hoc                        |  |
|  | Lam quen ghen, ghim manh moi & doi chat     |  |
|  |                               [ BAT DAU > ] |  |
|  +---------------------------------------------+  |
|                                                   |
|  +---------------------------------------------+  |
|  | MAN 1: CON GHEN LUC NUA DEM                 |  |
|  | [Star] [Star] [Star]   4 ung dung - 5 luot  |  |
|  |                               [ CHOI NGAY >]|  |
|  +---------------------------------------------+  |
|                                                   |
|  +---------------------------------------------+  |
|  | [Lock] MAN 2: TINH CU KHONG RU CUNG TOI     |  |
|  | Vuot qua Man 1 de mo khoa                   |  |
|  +---------------------------------------------+  |
|                                                   |
|  +---------------------------------------------+  |
|  | [Lock] MAN 3: BAY TIEU TAM CONG SO          |  |
|  | Vuot qua Man 2 de mo khoa                   |  |
|  +---------------------------------------------+  |
+---------------------------------------------------+
```

### Sections & Actions
- **Header**: Screen title (`"HỒ SƠ ĐIỀU TRA"`) and optional sound toggle control.
- **Primary content**:
  - **Husband Swipe Carousel**: Left/right swipe gesture plus accessible `[ < ]` and `[ > ]` arrows and pagination dots. Displays husband portrait image from profile/case data, name, age/occupation, and signature excuse teaser. Future unreleased husbands show a locked `"Sắp ra mắt"` card state.
  - **Vertical Level List**: Cards scoped to the selected husband.
    - **Level 0 Card**: Shows `"Đề xuất"` badge for first-time players; displays status (`"Chưa học"`, `"Đã bỏ qua"`, or `"Đã hoàn thành"`).
    - **Level 1-3 Cards**: Displays level title, best star rating (`0-3` stars) if unlocked, active app count & strike allowance, or `[Lock]` icon + prerequisite hint if locked.
- **Actions**:
  - Swipe left/right or tap `[ < ]` / `[ > ]` to switch active husband.
  - Tap an unlocked Level card to advance to **Screen 3 (Level Context & Persona)**.
  - Tap a locked Level card to show inline feedback banner (`"Bạn cần vượt qua màn chơi trước để mở khóa màn này!"`).
- **Navigation model**: Entry from Startup (`US-035`) or mid-case via Notification Dropdown (`US-036`/`US-038`).

---

## Screen 3: Level Context, Husband Persona & Interactive Intro Briefing (`US-037`)

### Sub-State 3A: Short Interactive Intro Dialogue (2-3 Taps)

```text
+---------------------------------------------------+
|  [ < Chon man ]                   [ Bo qua >> ]   |
+---------------------------------------------------+
|                                                   |
|              +---------------------+              |
|              |  [Husband Portrait] |              |
|              |  (Expression state) |              |
|              +---------------------+              |
|                                                   |
|  +---------------------------------------------+  |
|  | CHONG HOANG (23:40 - Phong ngu)             |  |
|  |                                             |  |
|  | "Vo oi, toi nay anh hop fix bug met qua,    |  |
|  |  anh di ngu truoc day. Dien thoai anh de    |  |
|  |  tren ban sac nha..."                       |  |
|  |                                             |  |
|  |  Beat 1 / 3               [ Cham de tiep > ]|  |
|  +---------------------------------------------+  |
+---------------------------------------------------+
```

### Sub-State 3B: Case Briefing & Husband Persona Card

```text
+---------------------------------------------------+
|  [ < Chon man ]             HO SO MAN 1           |
+---------------------------------------------------+
|  +---------------------------------------------+  |
|  | [Portrait]  CHONG HOANG                     |  |
|  |             Senior Dev - Technosoft         |  |
|  |             Loi khai: "Hop fix bug o cty"   |  |
|  +---------------------------------------------+  |
|                                                   |
|  LINH CAM CUA VO (BOI CANH VU AN)                 |
|  +---------------------------------------------+  |
|  | 23:45 dem. Chong vua ngu say nhung man hinh |  |
|  | dien thoai chot sang lien tuc voi cac thong |  |
|  | bao bi an noi dung. Linh cam vo thay co mui!|  |
|  +---------------------------------------------+  |
|                                                   |
|  THONG SO MAN CHOI                                |
|  [ 4 ung dung hoat dong ]  [ 5 luot nghi ngo ]    |
|  [ Khoa man hinh: FaceID / Vuot mo ]              |
|                                                   |
|  +---------------------------------------------+  |
|  |            BAT DAU DIEU TRA                 |  |
|  +---------------------------------------------+  |
+---------------------------------------------------+
```

### Sections & Actions
- **Header**: `[ < Chọn màn ]` back button; `[ Bỏ qua >> ]` visible during Sub-State 3A intro dialogue.
- **Primary content**:
  - **Sub-State 3A**: 2-3 sequential dialogue beats establishing the husband's excuse right before falling asleep. Tapping anywhere on the dialogue box advances to the next beat; completing the final beat reveals Sub-State 3B.
  - **Sub-State 3B**: Structured Case Briefing & Husband Persona card (portrait, name, occupation, stated alibi, wife's suspicion hook, active app count, strike limit, lockscreen mode).
- **Actions**:
  - `[ Bỏ qua >> ]` skips remaining dialogue beats straight to Sub-State 3B.
  - `[ BẮT ĐẦU ĐIỀU TRA ]` transitions into **Screen 4 (iOS 27 Phone Shell Lockscreen)**.
  - Mid-case recall (opened from Notification Dropdown or Wife's Notebook) renders Sub-State 3B directly as a read-only overlay with a `[ Đóng ]` button (no intro dialogue replay).

---

## Screen 4: iOS 27 Phone Shell Lockscreen & Hybrid Unlock (`US-038`)

### Sub-State 4A: Lockscreen View (Inside Phone Bezel)

```text
+---------------------------------------------------+
|  [Lock]       [ Dynamic Island ]   [5G] [Bat 42%] |
+---------------------------------------------------+
|                                                   |
|               Thu Nam, 15 thang 10                |
|                                                   |
|                      23:45                        |
|                                                   |
|         ( Husband Wallpaper Background )          |
|                                                   |
|  -- Lockscreen Notifications (Privacy-Masked) --- |
|  +---------------------------------------------+  |
|  | [Zola]  Zola                     Vua xong   |  |
|  | Ban co 3 tin nhan moi (An noi dung)         |  |
|  +---------------------------------------------+  |
|  +---------------------------------------------+  |
|  | [Techcornbank]  Techcornbank      20:48     |  |
|  | Co 1 thong bao moi (Mo khoa de xem)         |  |
|  +---------------------------------------------+  |
|                                                   |
|  -- Unlock Prompt ------------------------------  |
|  (L0-L1) [FaceID Icon] Len quet FaceID / Vuot len |
|  (L2-L3) [Keypad Icon] Vuot len de nhap mat khau  |
|                                                   |
|               =====================               |
+---------------------------------------------------+
```

### Sub-State 4B: Optional Passcode Challenge (Level 2-3 Only)

```text
+---------------------------------------------------+
|  23:45        [ Dynamic Island ]   [5G] [Bat 42%] |
+---------------------------------------------------+
|               [Lock] NHAP MAT KHAU                |
|           Goi y: Ngay ky niem cua chong?          |
|                                                   |
|                ( * ) ( * ) ( o ) ( o )            |
|                                                   |
|   [ 1 ]            [ 2 ABC ]         [ 3 DEF ]    |
|   [ 4 GHI ]        [ 5 JKL ]         [ 6 MNO ]    |
|   [ 7 PQRS ]       [ 8 TUV ]         [ 9 WXYZ ]   |
|                    [ 0 ]             [ Delete ]   |
|                                                   |
|   [ Huy ]                       Nghi ngo: 1 / 4   |
+---------------------------------------------------+
```

### Sections & Actions
- **Header**: System status bar with `[Lock]` indicator, `[Dynamic Island]`, signal, and battery (strict zero-carrier rule).
- **Primary content**: Narrative date, large iOS 27 lockscreen clock, husband's wallpaper, and 1-2 privacy-masked notification stacks (iOS "Show Previews: When Unlocked" style) that create intrigue without revealing suspect names, disguise aliases, or clue text.
- **Zero-Spoiler Lockscreen Rule**: Lockscreen notifications MUST hide sensitive sender names and message/transaction bodies (displaying only app name, unread count/generic label, and timestamp, or benign filler) so the player discovers suspects and clues organically inside the apps.
- **Unlock Mechanics (Hybrid)**:
  - **Level 0 & Level 1**: Swiping up or tapping the unlock area / FaceID icon triggers a brief playful FaceID scan animation (`"Đang lén quét FaceID lúc chồng ngủ..."` -> `[Unlock]`) and transitions to the Phone Home Screen with zero strike penalty.
  - **Level 2 & Level 3 (when lockscreen passcode is configured)**: Swiping up or tapping opens Sub-State 4B (4-digit keypad with optional narrative hint). Correct PIN unlocks the phone to the Home Screen. Incorrect PIN triggers error shake, clears dots, increments suspicion strike (+1), and triggers the shared lockout / fail flow if strike limit is reached.
  - **Notification Preview Tap**: Tapping a lockscreen notification triggers unlock first (FaceID on L0-1, or PIN prompt on L2-3) and then opens directly into that notification's target app.

---

## Screen 5: Phone Shell Notification Dropdown & Mid-Case Level Switch (`US-036` / `US-037` / `US-038`)

### Sub-State 5A: Notification Dropdown Shade (Pull Down From Status Bar)

```text
+---------------------------------------------------+
|  23:45        [ Dynamic Island ]   [5G] [Bat 42%] |
+---------------------------------------------------+
|  TRUNG TAM THONG BAO & DIEU KHIEN                 |
|                                                   |
|  -- Quick Case Actions -------------------------  |
|  +-----------------------+ +-------------------+  |
|  | [File] Ho so vu an    | | [Grid] Chon man   |  |
|  +-----------------------+ +-------------------+  |
|  +-----------------------+ +-------------------+  |
|  | [Refresh] Choi lai    | | [Book] So tay Vo  |  |
|  +-----------------------+ +-------------------+  |
|                                                   |
|  -- Recent App Activity (Non-Spoiler) --------- |
|  +---------------------------------------------+  |
|  | [Zola]  Zola                     Vua xong   |  |
|  | 3 tin nhan chua doc                         |  |
|  +---------------------------------------------+  |
|  +---------------------------------------------+  |
|  | [Shopoo]  Shopoo                  Hom nay   |  |
|  | Cap nhat trang thai don hang                |  |
|  +---------------------------------------------+  |
|                                                   |
|            [ Vuot len / Cham de dong ]            |
|               =====================               |
+---------------------------------------------------+
```

### Sub-State 5B: Mid-Case Level Switch Confirmation Modal

```text
+---------------------------------------------------+
|             DOI MAN CHOI?                         |
|                                                   |
|  Tien do chua doi chat cua man hien tai se mat.   |
|  Ban co chac chan muon quay lai Chon man choi?    |
|                                                   |
|  +-------------------+   +---------------------+  |
|  |     O LAI         |   |    DOI MAN CHOI     |  |
|  +-------------------+   +---------------------+  |
+---------------------------------------------------+
```

### Key Interactions & States
- **Opening Dropdown**: Player pulls down from the top status bar / Dynamic Island area (or taps a subtle top pull-handle) on any in-phone screen to open the Notification Dropdown. (Replaces deprecated AssistiveTouch).
- **Quick Case Actions**:
  - `[File] Hồ sơ vụ án`: Opens Screen 3B (Case Briefing & Husband Persona Card) in read-only overlay mode.
  - `[Grid] Chọn màn`: Opens Sub-State 5B confirmation modal if a case is active; confirming resets unsubmitted session clues and returns to Screen 2 (Level Selector Hub).
  - `[Refresh] Chơi lại`: Confirms and restarts the current level from Screen 4 (Lockscreen) or Home Screen.
  - `[Book] Sổ tay Vợ`: Opens the Wife's Detective Notebook.
- **Reduced Motion**: Under `prefers-reduced-motion: reduce`, all slide/fade/FaceID scan transitions simplify to instant or short static crossfades; swipe actions remain accessible via tap buttons (`[ < ]`, `[ > ]`, `[ Mở khóa ]`, `[ Đóng ]`).

## Constraints & Assumptions
- All touch targets (buttons, level cards, carousel arrows, keypad digits, dropdown actions) meet the >= 44x44px minimum target size.
- Strict zero-emoji invariant enforced across UI chrome (vector Ionicons used at implementation time).
- All husband portraits, dialogue beats, briefing copy, and lockscreen notifications are loaded declaratively from case/husband config files (`US-001`).
